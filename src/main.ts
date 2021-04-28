import * as core from '@actions/core';
import * as io from '@actions/io';
import cp from 'child_process';
import path from 'path';
import * as installer from './installer';

export async function run() {
  try {
    let versionSpec = core.getInput('buf-version') || 'latest';
    let ghAuthToken = core.getInput('token');

    core.info(`Setup buf version spec ${versionSpec}`);
    const installDir = await installer.getBuf(versionSpec, ghAuthToken);

    core.info('Adding buf binary to PATH');
    await addBinToPath(installDir);

    core.info(`Successfully setup buf version ${versionSpec}`);
    core.info(cp.execSync(`${await io.which('buf')} --version`).toString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function addBinToPath(installDir: string): Promise<boolean> {
  core.addPath(path.join(installDir, 'bin'));

  let g = await io.which('buf');
  core.debug(`which buf :${g}:`);
  if (!g) {
    core.debug('buf not in the path');
    return false;
  }
  return true;
}
