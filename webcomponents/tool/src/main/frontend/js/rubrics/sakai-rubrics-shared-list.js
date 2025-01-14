import { html } from "/webcomponents/assets/lit-element/lit-element.js";
import "./sakai-rubric-readonly.js";
import { SakaiRubricsHelpers } from "./sakai-rubrics-helpers.js";
import { SakaiRubricsList } from "./sakai-rubrics-list.js";

const rubricName = 'name';
const rubricTitle = 'title';
const rubricCreator = 'creator';
const rubricModified = 'modified';

export class SakaiRubricsSharedList extends SakaiRubricsList {

  constructor() {

    super();

    this.getSharedRubrics();
  }

  static get properties() {

    return {
      siteId: { attribute: "site-id", type: String },
      rubrics: { attribute: false, type: Array },
      enablePdfExport: { attribute: "enable-pdf-export", type: Boolean },
    };
  }

  shouldUpdate() {
    return this.rubrics;
  }

  render() {

    return html`
      <div role="tablist">
      ${this.rubrics.map(r => html`
        <sakai-rubric-readonly rubric="${JSON.stringify(r)}" @copy-to-site="${this.copyToSite}" ?enable-pdf-export="${this.enablePdfExport}"></sakai-rubric-readonly>
      `)}
      </div>
    `;
  }

  refresh() {
    this.getSharedRubrics();
  }

  getSharedRubrics() {

    const url = "/api/rubrics/shared";
    fetch(url, { credentials: "include" })
    .then(r => {

      if (r.ok) {
        return r.json();
      }
      throw new Error("Network error while getting shared rubrics");
    })
    .then(rubrics => this.rubrics = rubrics)
    .catch (error => console.error(error));
  }

  copyToSite(e) {

    SakaiRubricsHelpers.get(`/api/sites/${this.siteId}/rubrics/${e.detail}/copyToSite`, {})
      .then(() => this.dispatchEvent(new CustomEvent("copy-share-site")));
  }

  sortRubrics(rubricType, ascending) {

    switch (rubricType) {
      case rubricName:
        this.rubrics.sort((a, b) => ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
        break;
      case rubricTitle:
        this.rubrics.sort((a, b) => ascending ? a.siteTitle.localeCompare(b.siteTitle) : b.siteTitle.localeCompare(a.siteTitle));
        break;
      case rubricCreator:
        this.rubrics.sort((a, b) => ascending ? a.creatorDisplayName.localeCompare(b.creatorDisplayName) : b.creatorDisplayName.localeCompare(a.creatorDisplayName));
        break;
      case rubricModified:
        this.rubrics.sort((a, b) => ascending ? a.formattedModifiedDate.localeCompare(b.formattedModifiedDate) : b.formattedModifiedDate.localeCompare(a.formattedModifiedDate));
        break;
    }
    this.requestUpdate('rubrics');
  }
}

const tagName = "sakai-rubrics-shared-list";
!customElements.get(tagName) && customElements.define(tagName, SakaiRubricsSharedList);
