const apiPath = "/api/v1/";

const fields = [
  "age",
  "height1",
  "height2",
  "weight",
  "goal",
  "duration",
  "gender",
  "build",
  "focus",
  // "focus2",
  // "bwOnly",
  // "video"
];

const spinner = (id, msg = "Loading") => `
<div class="spinner-loading" id="${id}">
  <div class="spinner-loading_txt">${msg}...</div>
  <div class="spinner">
    <div class="bounce1" ></div>
    <div class="bounce2" ></div>
    <div class="bounce3" ></div>
    <div class="bounce4" ></div>
    <div class="bounce5" ></div>
    <div class="bounce6" ></div>
    <div class="bounce7" ></div>
  </div>
</div>`;

const icoVideo =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" /></svg>';

let lastJsonRoutine = null;
let isLoading = false;
let showPrompt = false;
let focus2 = false;
const elems = {};
const $ = (id, noCache) => {
  if (noCache) {
    return document.getElementById(id);
  }
  if (!elems[id]) {
    elems[id] = document.getElementById(id);
  }
  return elems[id];
};

const lcGet = (key) => localStorage.getItem("jackedgpt-" + key);
const lcSet = (key, data) => localStorage.setItem("jackedgpt-" + key, data);

const getFieldsValues = () => {
  const ps = {};
  fields.forEach((p) => {
    ps[p] = $(p)?.value;
  });
  ps.height = ps.height1 + (ps.height2 > 0 ? " " + ps.height2 : "") + " ft";
  ps.video = $("video").checked;
  ps.bwOnly = $("bwOnly").checked;
  if (focus2 && ps.focus !== "" && ps.focus !== "full body") {
    const f2 = $("focus2").value;
    if (f2 !== ps.focus) {
      ps.focus2 = f2;
    }
  }
  return ps;
};

const getApiUrl = (ps) => {
  let opts = "";
  if (ps.bwOnly) {
    opts += "&bwOnly=1";
  }
  if (ps.video) {
    opts += "&video=1";
  }
  let focus = ps.focus;
  if (ps.focus2) focus += " and " + ps.focus2;
  return `${apiPath}routine?age=${ps.age}&height=${ps.height}&weight=${ps.weight}&gender=${ps.gender}&build=${ps.build}&duration=${ps.duration}&focus=${focus}&goal=${ps.goal}${opts}`;
};

const videoLoaded = (id) => {
  const spinner = $(id, true);
  if (spinner) {
    const video = spinner.nextSibling;
    spinner.remove();
    video.style.display = "block";
  }
};

const showVideo = (elem, ytToken) => {
  const nextElem = elem.nextSibling;
  if (nextElem && nextElem.className === "e-video") {
    nextElem.remove();
  } else {
    let w = 640,
      h = 390;
    const ww = document.body.clientWidth;
    if (ww < 640) {
      w = ww - 10;
      h = w * 0.6;
    }
    const video = document.createElement("div");
    video.className = "e-video";
    video.innerHTML =
      spinner(ytToken, "Loading video") +
      `<iframe title="YouTube video player" type="text/html" onload="javascript:videoLoaded('${ytToken}')" width="${w}" height="${h}" src="https://www.youtube.com/embed/${ytToken}" allowFullScreen></iframe>`;
    elem.insertAdjacentElement("afterend", video);
  }
};

const videoLink = (videoKey) => {
  if (videoKey) {
    return `<div class="video" onclick="javascript:showVideo(this,'${videoKey}')">${icoVideo}</div>`;
  }
  return ".";
};

const formatRoutine = (ps, r) => {
  const intro = `Here is a ${ps.bwOnly ? "bodyweight " : ""} ${
    ps.focus + (ps.focus2 ? " and " + ps.focus2 : "")
  } routine that you can do to ${ps.goal}:`;
  const exercises = r
    ?.map(
      (e) =>
        `<li><strong>${e.name}</strong>: ${e.sets} sets ${
          e.reps ? "of " + e.reps : ""
        }${videoLink(e.youtube_link)}${
          e.instructions ? `<div class="inst">${e.instructions}</div>` : ""
        }</li>`
    )
    .join("");
  const footer =
    "Remember to warm up before starting the routine and cool down afterwards. Adjust the number of sets and reps based on your current fitness level. Consistency is key, so aim to do this routine at least 3 times a week for best results.";
  return `<h2>Your routine</h2><div><p>${intro}</p><ol>${exercises}</ol><p>${footer}</p></div>`;
};

const showFetchError = (msg) =>
  ($("response").innerHTML = `<p class="error">${msg}</p>`);

const genRoutine = async () => {
  if (!isLoading) {
    isLoading = true;
    $("response").innerHTML = spinner("s1", "Generating routine");
    const ps = getFieldsValues();
    const url = getApiUrl(ps);
    try {
      let response = await fetch(url);
      response = await response.json();
      lastJsonRoutine = response.data;
    } catch (err) {
      showFetchError("Error: Invalid JSON reply.");
      isLoading = false;
      return;
    }
    let html = formatRoutine(ps, lastJsonRoutine);
    lcSet("routine", html);
    lcSet("params", JSON.stringify(ps));
    if (showPrompt) {
      html = '<div class="prompt">' + data.prompt + "</div>" + html;
    }
    $("response").innerHTML = html;
    $("btns2").style.display = "block";
    isLoading = false;
  }
};

const addFocus2 = () => {
  setFocus2(true, "none", "block");
};
const removeFocus2 = () => {
  setFocus2(false, "inline", "none");
};
const setFocus2 = (f2, dAdd, dRow2) => {
  focus2 = f2;
  $("ico2focus").style.display = dAdd;
  $("focus2-row").style.display = dRow2;
};

const setup = () => {
  let ps = lcGet("params");
  if (ps) {
    ps = JSON.parse(ps);
    fields.forEach((p) => {
      $(p).value = ps[p];
    });
    if (ps.video) {
      $("video").checked = true;
    }
    if (ps.bwOnly) {
      $("bwOnly").checked = true;
    }
    if (ps.focus2) {
      $("focus2").value = ps.focus2;
      addFocus2();
    }
  }
  const r = lcGet("routine");
  if (r) {
    $("response").innerHTML = r;
    $("btns2").style.display = "block";
  }
  $("btnGen1").addEventListener("click", genRoutine);
  $("btnGen2").addEventListener("click", genRoutine);
  $("ico2focus").addEventListener("click", addFocus2);
  $("ico1focus").addEventListener("click", removeFocus2);
};

window.onload = setup;
