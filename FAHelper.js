// ==UserScript==
// @name         L-E's FA Helper
// @namespace    http://your.homepage/
// @version      0.1
// @description  Useful tools to improve your FA experience.
// @author       Elizabeth Harper <elliefops@gmail.com>
// @match        https://www.furaffinity.net/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {

  var FAHConfig = {
    previewSize: 400,
    viewPage:    "https://www.furaffinity.net/view/",
    subPage:     "https://www.furaffinity.net/msg/submissions/",
    previewPage: "https://t.facdn.net/"
  };

  // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  //
  // FA Helper Core
  //
  // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????

  /**
   * Fur Affinity Helper
   *
   * @constructor
   */
  function FAHelper() {
    /**
     * @type {string}
     */
    this.location = window.location.href;
    this.module = null;

    this.init();
  }

  FAHelper.prototype.init = function () {
    this.getModule();
  };

  FAHelper.prototype.getModule = function () {
    if (this.location.indexOf(FAHConfig.subPage) === 0) {
      this.module = new FA_sub(this);
    } else if (this.location.indexOf(FAHConfig.viewPage) === 0) {
    }
  };

  /**
   * Make Submission Link
   *
   * @param i {int}
   * @returns {string}
   */
  FAHelper.prototype.makeArtLink = function (i) {
    return FAHConfig.viewPage + i;
  };

  /**
   * Open Submission In Background Tab
   *
   * @param link
   */
  FAHelper.prototype.openArtTab = function (link) {
    GM_openInTab(link, false);
  };
  //  FAHelper.prototype.submitFavorite = function () {};

  // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  //
  // Submissions View Manager
  //
  // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????

  /**
   * Fur Affinity Submissions Page Manager
   *
   * @param helper {FAHelper}
   * @constructor
   */
  function FA_sub(helper) {
    this.helper = helper;
    this.form = document.getElementById("messages-form");
    this.view = new HoverView(helper);

    this.init();
  }

  //FAHelper.prototype.hoverLoad = function() {};

  FA_sub.prototype.modSubmissionUI = function () {
    var forms;
    forms = document.querySelectorAll(".actions");
    for (var i = 0; i < forms.length; i++) {
      forms[i].appendChild(this.makeTabsButton());
    }
  };

  /**
   * Make "Load In Tabs" Button
   *
   * @returns {Element}
   */
  FA_sub.prototype.makeTabsButton = function () {
    var button = document.createElement("INPUT");
    button.setAttribute("type", "button");
    button.setAttribute("value", "Load In Tabs");
    button.setAttribute("class", "octoTabsButton button");
    button.addEventListener("click", this.handleTabsButton());
    return button;
  };

  /**
   * Handle "Load In Tabs" Button Click
   */
  FA_sub.prototype.handleTabsButton = function () {
    var self = this;

    return function () {
      var boxes = self.form.querySelectorAll('input[type=checkbox]:checked');
      var id, i;

      for (i = 0; i < boxes.length; i++) {
        id = parseInt(boxes[i].getAttribute("value"));
        if (id > 0) {
          self.helper.openArtTab(self.helper.makeArtLink(id));
        }
      }
    };
  };

  FA_sub.prototype.init = function () {
    this.modSubmissionUI();
  };

  // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  //
  // Image Hover View
  //
  // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????

  /**
   *
   * @param helper {FAHelper}
   * @constructor
   */
  function HoverView (helper) {
    this.helper = helper;
    this.pane   = document.createElement("DIV");
    this.image  = document.createElement("IMG");

    this.init();
  }

  HoverView.prototype.handleMouseOver = function() {
    var self = this;
    return function(e) {
      self.pane.style.display = "block";
      self.image.setAttribute(
        "src",
        e.target.getAttribute("src").replace("@200", "@" + FAHConfig.previewSize.toString())
      );
    };
  };

  HoverView.prototype.handleMouseMove = function() {
    var self = this;
    return function (e) {
      var x, y, i;
      i = self.image.getBoundingClientRect();

      x = e.clientX + window.scrollX + 30;
      if (x + i.width > window.innerWidth) {
        x = e.clientX + window.scrollX - i.width - 30;
      }

      y = (e.clientY- i.height/2) + window.scrollY;

      if (y < window.scrollY) {
        y += window.scrollY - y;
      } else if (y + i.height > window.innerHeight + window.scrollY) {
        y -= y + i.height - (window.innerHeight + window.scrollY);
      }

      self.pane.style.top  = y.toString() + "px";
      self.pane.style.left = x.toString() + "px";
    };
  };

  HoverView.prototype.handleMouseOut = function() {
    var self = this;
    return function() {
      self.pane.style.display = "none";
    };
  };

  HoverView.prototype.hoverImage = function (id) {
    var image = document.createElement('IMAGE');
    image.setAttribute("src", this.makePreviewLink(id));
  };

  HoverView.prototype.makeHoverPane = function(id) {
    var s, pane = document.createElement('DIV');
    pane.appendChild(this.hoverImage(id));
    s = pane.style;
    s.position = "absolute";
    return pane;
  };

  HoverView.prototype.makePreviewLink = function (id) {
    var a, b;
    a = id.toString();
    b = FAHConfig.previewSize.toString();
    return FAHConfig.previewPage + a + '@' + b + '-' + a;
  };

  HoverView.prototype.init = function() {

    // Init Elements
    this.pane.appendChild(this.image);
    this.pane.style.display = "none";
    this.pane.style.position = "absolute";
    this.pane.style.zIndex = 1000;
    this.pane.style.border = "2px solid pink";
    document.querySelector("body").appendChild(this.pane);

    // Init Handlers
    var i, a;
    a = document.querySelectorAll("b img");
    for (i = 0; i < a.length; i++) {
      a[i].addEventListener("mouseover", this.handleMouseOver());
      a[i].addEventListener("mouseout", this.handleMouseOut());
      a[i].addEventListener("mousemove", this.handleMouseMove());
    }
  };

  new FAHelper();
})();

