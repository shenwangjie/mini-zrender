
// console.error('这里的declear const wx: 用的真是太好了')

class Browser {
  constructor() {
    this.firefox = false;
    this.ie = false
    this.edge = false
    this.newEdge = false
    this.weChat = false
    this.version = 0
  }
}

class Env {
  constructor() {
    this.browser = new Browser();
    this.node = false;
    this.wxa = false;
    this.worker = false;

    this.svgSupported = false;
    this.touchEventSupported = false;
    this.pointerEventSupported = false;
    this.domSupported = false;
    this.transformSupported = false;
    this.transform3dSupported = false;

    this.hasGlobalWindow = typeof window !== 'undefined';
  }
}

const env = new Env()

if (typeof wx === 'object' && typeof wx.getSystemInfoSync === 'function') {
  env.wxa = true; // 初步估测这个是代表微信环境
  env.touchEventSupported = true;
} else if (typeof document === 'undefined' && typeof self != 'undefined') {
  env.worker = true
  console.error('什么是in worker')
} else if (!env.hasGlobalWindow || 'Deno' in window) {
  // 在node环境中
  env.node = true;
  env.svgSupported = true;
} else {
  detect(navigator.userAgent, env)
}

function detect(ua, env) {
  const browser = env.browser;
  const firefox = ua.match(/Firefox\/([\d.]+)/);
  const ie = ua.match(/MSIE\s([\d.]+)/)
        // IE 11 Trident/7.0; rv:11.0
        || ua.match(/Trident\/.+?rv:(([\d.]+))/);
  const edge = ua.match(/Edge?\/([\d.]+)/); // IE 12 and 12+

  const weChat = (/micromessenger/i).test(ua);
  console.error('这些正则得看看')

  if (firefox) {
    browser.firefox = true;
    browser.version = firefox[1]
  }
  if (ie) {
    browser.ie = true;
    browser.version = ie[1]
  }
  if (edge) {
    browser.edge = true;
    browser.version = edge[1];
    browser.newEdge = +edge[1].split('.')[0] > 18;
    console.error('这个+是干嘛的')
  }

  // It is difficult to detect WeChat in Win Phone precisely, because ua can
    // not be set on win phone. So we do not consider Win Phone.
  if (weChat) {
    browser.weChat = true;
  }
}

export default env;