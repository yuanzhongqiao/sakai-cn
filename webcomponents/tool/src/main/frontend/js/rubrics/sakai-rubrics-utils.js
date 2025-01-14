window.top.rubrics = window.top.rubrics || {};
window.top.rubrics.utils = window.top.rubrics.utils || {

  lightbox: null,
  windowRef: window != window.top ? window.top : window,

  initLightbox(i18n, siteId) {

    const rubrics = window.top.rubrics;

    if (rubrics.utils.lightbox) {
      return;
    }

    // appends HTML string as node
    const appendStringAsNodes = function (element, html) {

      let frag = document.createDocumentFragment(), tmp = document.createElement("body"), child;
      tmp.innerHTML = html;
      // Append elements in a loop to a DocumentFragment, so that the browser does
      // not re-render the document for each node
      while ((child = tmp.firstChild) != null) {
        frag.appendChild(child);
      }
      element.appendChild(frag); // Now, append all elements at once
      frag = tmp = null;
    };

    appendStringAsNodes(rubrics.utils.windowRef.document.body, `
      <div class="rubrics-lightbox" tabindex="0" style="display:none">
        <div class="container">
          <a href="#" aria-label="${i18n.close_dialog}">&times;</a>
          <sakai-rubric-student site-id="${siteId}"></sakai-rubric-student>
        </div>
      </div>
    `);

    rubrics.utils.windowRef.document.body.querySelector(".rubrics-lightbox a").addEventListener("click", e => {

      e.preventDefault();
      rubrics.utils.closeLightbox();
    });

    rubrics.utils.lightbox = rubrics.utils.windowRef.document.querySelector(".rubrics-lightbox");
  },

  closeLightbox() {

    const rubrics = window.top.rubrics;

    const el = rubrics.utils.lightbox.querySelector("sakai-rubric-student");

    el.handleClose();

    el.removeAttribute("rubric-id");
    el.removeAttribute("preview");
    el.removeAttribute("tool-id");
    el.removeAttribute("entity-id");
    el.removeAttribute("evaluated-item-id");
    el.removeAttribute("instructor");
    el.removeAttribute("evaluated-item-owner-id");
    el.removeAttribute("peer-or-self");

    rubrics.utils.lightbox.style.display = "none";
    rubrics.utils.windowRef.document.body.style.overflow = "auto";
  },

  showRubric(id, attributes, launchingElement) {

    const rubrics = window.top.rubrics;

    rubrics.utils.windowRef.document.body.style.overflow = "hidden";
    const scrollTop = rubrics.utils.windowRef.pageYOffset || rubrics.utils.windowRef.document.documentElement.scrollTop;

    rubrics.utils.lightbox.style.height = `${rubrics.utils.windowRef.window.innerHeight  }px`;
    rubrics.utils.lightbox.style.width = `${rubrics.utils.windowRef.window.innerWidth  }px`;
    rubrics.utils.lightbox.style.top = `${scrollTop  }px`;

    const el = rubrics.utils.lightbox.querySelector("sakai-rubric-student");

    if (!attributes) {
      el.setAttribute("rubric-id", id);
      el.setAttribute("preview", true);
      el.removeAttribute("tool-id");
      el.removeAttribute("entity-id");
      el.removeAttribute("evaluated-item-id");
      el.removeAttribute("instructor");
      el.removeAttribute("evaluated-item-owner-id");
      el.removeAttribute("peer-or-self");
    } else {
      el.removeAttribute("rubric-id");
      if (attributes["force-preview"]) {
        el.setAttribute("force-preview", "force-preview");
      } else {
        el.removeAttribute("force-preview");
      }
      el.setAttribute("tool-id", attributes["tool-id"]);
      el.setAttribute("entity-id", attributes["entity-id"]);
      el.setAttribute("evaluated-item-id", attributes["evaluated-item-id"]);
      el.setAttribute("instructor", attributes.instructor);
      el.setAttribute("evaluated-item-owner-id", attributes["evaluated-item-owner-id"]);
      el.setAttribute("peer-or-self", attributes["peer-or-self"]);
    }
    rubrics.utils.lightbox.style.display = "block";
    rubrics.utils.lightbox.focus();
    rubrics.utils.lightbox.addEventListener("keydown", e => {

      if (e.keyCode === 27) {
        rubrics.utils.closeLightbox();
        if (launchingElement) {
          launchingElement.focus();
        }
      }
    }, { once: true });
  }
};
