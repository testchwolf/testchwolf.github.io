/* 内部预览密码门（客户端）——仅用于挡住路人 + 搜索引擎，非真正加密。
   密码以 SHA-256 存于 HASH（明文不入库）；需改密码请重算哈希。
   正式上线时：从各页 <head> 移除本脚本，并把 noindex/robots 恢复。 */
(function () {
  var KEY = "chw_gate_ok";
  var HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
  var FB = "7c540741"; // 非安全上下文(http)下的后备哈希，避免 crypto.subtle 不可用导致无法登录
  if (sessionStorage.getItem(KEY) === "1") return;      // 本次会话已解锁
  document.documentElement.style.visibility = "hidden"; // 先藏住正文，防闪现

  function fbHash(s) { // djb2(xor) 后备，仅在 crypto.subtle 不可用时使用
    var h = 5381;
    for (var i = 0; i < s.length; i++) { h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; }
    return h.toString(16);
  }

  function verify(s) { // 返回 Promise<boolean>
    if (window.crypto && crypto.subtle && window.isSecureContext) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
        var h = Array.prototype.map.call(new Uint8Array(b), function (x) {
          return ("0" + x.toString(16)).slice(-2);
        }).join("");
        return h === HASH;
      }).catch(function () { return fbHash(s) === FB; });
    }
    return Promise.resolve(fbHash(s) === FB);
  }

  function build() {
    var w = document.createElement("div");
    w.id = "chw-gate";
    w.style.cssText = "visibility:visible;position:fixed;inset:0;z-index:2147483647;background:#1b1c20;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif";
    w.innerHTML =
      '<div style="text-align:center;width:min(340px,86vw);padding:24px">' +
        '<img src="assets/img/logo.png" alt="C.H. WOLF · Glashütte" style="height:46px;width:auto;opacity:.92;margin-bottom:26px">' +
        '<div style="color:#c7c1b8;font-size:13.5px;letter-spacing:.04em;line-height:1.7;margin-bottom:20px">此页面为内部预览<br>请输入访问密码 · Access code</div>' +
        '<input id="chw-pw" type="password" autocomplete="off" placeholder="密码 / Password" ' +
          'style="width:100%;box-sizing:border-box;padding:12px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(199,193,184,.3);border-radius:3px;color:#faf8f4;font-size:15px;text-align:center;outline:none">' +
        '<button id="chw-go" style="width:100%;box-sizing:border-box;margin-top:12px;padding:12px;background:#c88a3a;border:none;border-radius:3px;color:#1b1c20;font-size:13.5px;letter-spacing:.1em;cursor:pointer">进 入 · ENTER</button>' +
        '<div id="chw-err" style="color:#d98c6a;font-size:12.5px;height:16px;margin-top:10px"></div>' +
      '</div>';
    document.body.appendChild(w);
    var inp = w.querySelector("#chw-pw"),
        btn = w.querySelector("#chw-go"),
        err = w.querySelector("#chw-err");
    inp.focus();
    function submit() {
      verify(inp.value).then(function (ok) {
        if (ok) {
          sessionStorage.setItem(KEY, "1");
          w.parentNode.removeChild(w);
          document.documentElement.style.visibility = "";
        } else {
          err.textContent = "密码不正确 · Wrong code";
          inp.value = ""; inp.focus();
        }
      });
    }
    btn.addEventListener("click", submit);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
