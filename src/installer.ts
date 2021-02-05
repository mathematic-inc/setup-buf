import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import {Octokit} from '@octokit/core';
import path from 'path';
import * as semver from 'semver';
import * as sys from './system';

const octokit = new Octokit();

export async function getBuf(versionSpec: string) {
  let toolPath: string;
  toolPath = tc.find('buf', versionSpec, sys.getArch());
  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`);
    return toolPath;
  }

  core.info(
    `Checking if ${versionSpec} exists on the current platform and architecture...`
  );
  const dlUrl = await getDownloadLink(versionSpec);

  core.info(`Acquiring ${versionSpec} from ${dlUrl}`);
  const downloadPath = await tc.downloadTool(dlUrl);

  core.info('Extracting Buf...');
  let extPath = await tc.extractTar(downloadPath);
  core.info(`Successfully extracted buf to ${extPath}`);

  core.info('Adding to the cache ...');
  const cachedDir = await tc.cacheDir(
    path.join(extPath, 'buf'),
    'buf',
    versionSpec,
    sys.getArch()
  );

  core.info(`Successfully cached buf to ${cachedDir}`);
  return cachedDir;
}

export async function getDownloadLink(versionSpec: string): Promise<string> {
  const sysArch = sys.getArch();
  const sysPlat = sys.getPlatform();
  let archFilter: string;
  let platFilter: string;
  switch (sysArch) {
    case 'amd64':
      archFilter = 'x86_64';
      break;
    default:
      throw new Error(
        `Unable to find Buf version '${versionSpec}' for platform ${sysPlat} and architecture ${sysArch}.`
      );
  }
  switch (sysPlat) {
    case 'darwin':
      platFilter = 'Darwin';
      break;
    case 'linux':
      platFilter = 'Linux';
      break;
    default:
      throw new Error(
        `Unable to find Buf version '${versionSpec}' for platform ${sysPlat} and architecture ${sysArch}.`
      );
  }
  const {data: releases} = await octokit.request(
    'GET /repos/{owner}/{repo}/releases',
    {
      owner: 'bufbuild',
      repo: 'buf'
    }
  );
  switch (versionSpec) {
    case 'latest':
      for (const asset of releases[0].assets) {
        if (`buf-${platFilter}-${archFilter}.tar.gz` === asset.name) {
          return asset.browser_download_url;
        }
      }
      break;
    default:
      for (const release of releases) {
        const version = makeSemver(release.tag_name);
        if (semver.satisfies(version, versionSpec)) {
          for (const asset of release.assets) {
            if (`buf-${platFilter}-${archFilter}.tar.gz` === asset.name) {
              return asset.browser_download_url;
            }
          }
        }
      }
  }
  throw new Error(
    `Unable to find Buf version '${versionSpec}' for platform ${sysPlat} and architecture ${sysArch}.`
  );
}

// Convert the buf version syntax into semver for semver matching
// v1.13.1 => 1.13.1
// v1.13 => 1.13.0
// v1.10beta1 => 1.10.0-beta1, 1.10rc1 => 1.10.0-rc1
// v1.8.5beta1 => 1.8.5-beta1, 1.8.5rc1 => 1.8.5-rc1
export function makeSemver(release: string): string {
  release = release.replace('v', '');
  release = release.replace('beta', '-beta').replace('rc', '-rc');

  const parts = release.split('-');
  let verParts = parts[0].split('.');
  if (verParts.length == 2) {
    verParts.push('0');
  }

  return `${verParts.join('.')}${parts.length > 1 ? `-${parts[1]}` : ''}`;
}
