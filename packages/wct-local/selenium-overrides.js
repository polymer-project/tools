module.exports = {
  'selenium-overrides': {
    'baseURL': 'https://selenium-release.storage.googleapis.com',
    'version': '3.12.0',
    'drivers': {
      'chrome': {
        'version': '2.43',
        'arch': process.arch,
        'baseURL': 'https://chromedriver.storage.googleapis.com'
      },
      'ie': {
        'version': '3.12.0',
        'arch': process.arch,
        'baseURL': 'https://selenium-release.storage.googleapis.com'
      },
      'firefox': {
        'version': process.platform === '0.24.0', // 'win32' ? '0.24.0' : '0.24.0',
        'arch': process.arch,
        'baseURL': 'https://github.com/mozilla/geckodriver/releases/download'
      },
      'edge': {'version': '17134'}
    }
  }
}
