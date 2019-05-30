let ExportSettingsHandler = function() {

  let exportMenuBtn = document.getElementById('exportTriggersBtn');
  let importMenuBtn = document.getElementById('importTriggersBtn');
  let popupToggle = document.getElementById('popupClose');
  let exportPopupContent = document.getElementById('exportSettings-popup');
  let importPopupContent = document.getElementById('importSettings-popup');
  let exportPopupBtn = document.getElementById('exportSettings-copy');
  let importPopupBtn = document.getElementById('importSettings-load');
  let exportPopupValue = document.getElementById('exportSettings');
  let importPopupValue = document.getElementById('importSettings');

  exportMenuBtn.onclick = function() {
    // todo: dismiss the export div on close
    popupToggle.checked = true;
    exportPopupContent.style.display = 'block';

    var data = {};
    data["triggers"] = window.localStorage.getItem('triggers') || "{}";
    data["options"] = window.localStorage.getItem('options') || "{}";
    data["version"] = window.localStorage.getItem('version') || 0;
    exportPopupValue.value = LZString.compressToBase64(JSON.stringify(data));

    exportPopupBtn.onclick = function() {
      exportPopupValue.select();
      document.execCommand("copy");
      exportPopupBtn.innerText = "Copied!";
    };
  };

  importMenuBtn.onclick = function() {
    popupToggle.checked = true;
    importPopupContent.style.display = 'block';

    importPopupBtn.onclick = function() {
      var data = LZString.decompressFromBase64(importPopupValue.value);
      window.localStorage.setItem('triggers', data.triggers || '{}');
      window.localStorage.setItem('options', data.options || '{}');
      window.localStorage.setItem('version', data.version || 0);
      importPopupBtn.innerText = "Loaded!";
    };
  };
};
let exportSettingsHandler = ExportSettingsHandler();
