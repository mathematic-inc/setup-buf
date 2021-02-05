import os from 'os';

export function getPlatform(): NodeJS.Platform {
  let plat = os.platform();
  return plat;
}

type Architecture =
  | 'arm'
  | 'arm64'
  | 'ia32'
  | 'mips'
  | 'mipsel'
  | 'ppc'
  | 'ppc64'
  | 's390'
  | 's390x'
  | 'x32'
  | 'x64'
  | 'amd64';

export function getArch(): Exclude<Architecture, 'x64' | 'x32'> {
  let arch = os.arch();

  // wants amd64, 386, arm64, armv61, ppc641e, s390x
  // currently not supported by runner but future proofed mapping
  switch (arch) {
    case 'x64':
      arch = 'amd64';
      break;
    case 'x32':
      arch = '386';
      break;
  }

  return arch as Exclude<Architecture, 'x64' | 'x32'>;
}
