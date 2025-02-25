import { RubricsElement } from "./rubrics-element.js";
import { html } from "/webcomponents/assets/lit-element/lit-element.js";
import "./sakai-rubric-criterion-preview.js";
import "./sakai-rubric-criterion-student.js";
import "./sakai-rubric-pdf.js";
import { SakaiRubricsLanguage } from "./sakai-rubrics-language.js";

class SakaiRubricStudent extends RubricsElement {

  constructor() {

    super();

    this.preview = false;

    this.instanceSalt = Math.floor(Math.random() * Date.now());

    this.options = {};
    SakaiRubricsLanguage.loadTranslations().then(result => this.i18nLoaded = result);
  }

  static get properties() {

    return {
      entityId: { attribute: "entity-id", type: String },
      toolId: { attribute: "tool-id", type: String },
      siteId: { attribute: "site-id", type: String },
      stateDetails: String,
      preview: Boolean,
      instructor: Boolean,
      evaluatedItemId: { attribute: "evaluated-item-id", type: String },
      evaluatedItemOwnerId: { attribute: "evaluated-item-owner-id", type: String },
      rubric: { type: Object },
      rubricId: { attribute: "rubric-id", type: String },
      forcePreview: { attribute: "force-preview", type: Boolean },
      enablePdfExport: { attribute: "enable-pdf-export", type: Object },
      isPeerOrSelf: { attribute: "is-peer-or-self", type: Boolean }
    };
  }

  set toolId(value) {

    this._toolId = value;

    if (this.toolId && this.entityId) {
      this.init();
    }
  }

  get toolId() { return this._toolId; }

  set entityId(value) {

    this._entityId = value;
    if (this.toolId && this.entityId) {
      this.init();
    }
  }

  get entityId() { return this._entityId; }

  set preview(newValue) {

    this._preview = newValue;
    if (this.rubricId) {
      this.setRubric();
    }
  }

  get preview() { return this._preview; }

  set rubricId(newValue) {

    this._rubricId = newValue;
    if (this._rubricId != null && this.preview) {
      this.setRubric();
    }
  }

  get rubricId() { return this._rubricId; }

  handleClose() {

    const el = this.querySelector("sakai-rubric-criterion-student");
    el && el.handleClose();
  }

  shouldUpdate() {
    return this.i18nLoaded && this.rubric && (this.instructor || !this.options.hideStudentPreview);
  }

  render() {

    return html`
      <hr class="itemSeparator" />

      <div class="rubric-details student-view">
        <h3>
          <span>${this.rubric.title}</span>
          ${this.enablePdfExport ? html`
            <sakai-rubric-pdf
                site-id="${this.siteId}"
                rubric-title="${this.rubric.title}"
                rubric-id="${this.rubric.id}"
                tool-id="${this.toolId}"
                entity-id="${this.entityId}"
                evaluated-item-id="${this.evaluatedItemId}"
            >
            </sakai-rubric-pdf>
          ` : ""}
        </h3>

        ${this.instructor === 'true' ? html`
        <div class="rubrics-tab-row">
          <a href="javascript:void(0);"
              id="rubric-grading-or-preview-${this.instanceSalt}-tab"
              class="rubrics-tab-button rubrics-tab-selected"
              @keypress=${this.openGradePreviewTab}
              @click=${this.openGradePreviewTab}>
            <sr-lang key="grading_rubric">gradingrubric</sr-lang>
          </a>
          <a href="javascript:void(0);"
              id="rubric-student-summary-${this.instanceSalt}-tab"
              class="rubrics-tab-button"
              @keypress=${this.makeStudentSummary}
              @click=${this.makeStudentSummary}>
            <sr-lang key="student_summary">studentsummary</sr-lang>
          </a>
          <a href="javascript:void(0);"
              id="rubric-criteria-summary-${this.instanceSalt}-tab"
              class="rubrics-tab-button"
              @keypress=${this.makeCriteriaSummary}
              @click=${this.makeCriteriaSummary}>
            <sr-lang key="criteria_summary">criteriasummary</sr-lang>
          </a>
        </div>
        ` : html``}

        <div id="rubric-grading-or-preview-${this.instanceSalt}" class="rubric-tab-content rubrics-visible">
          ${this.preview || this.forcePreview ? html`
          <sakai-rubric-criterion-preview
            .criteria="${this.rubric.criteria}"
            .weighted=${this.rubric.weighted}
          ></sakai-rubric-criterion-preview>
          ` : html`
          <sakai-rubric-criterion-student
            .criteria="${this.rubric.criteria}"
            rubric-association="${JSON.stringify(this.association)}"
            .evaluationDetails=${this.evaluation.criterionOutcomes}
            ?preview="${this.preview}"
            entity-id="${this.entityId}"
            .weighted=${this.rubric.weighted}
          ></sakai-rubric-criterion-student>
          `}
        </div>
        <div id="rubric-student-summary-${this.instanceSalt}" class="rubric-tab-content"></div>
        <div id="rubric-criteria-summary-${this.instanceSalt}" class="rubric-tab-content"></div>
      </div>
    `;
  }

  setRubric() {

    const url = `/api/sites/${this.siteId}/rubrics/${this.rubricId}`;
    fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" } })
    .then(r => {

      if (r.ok) {
        return r.json();
      }
      throw new Error("Network error while getting rubric");
    })
    .then(rubric => this.rubric = rubric)
    .catch (error => console.error(error));
  }

  init() {

    // First, grab the tool association
    const url = `/api/sites/${this.siteId}/rubric-associations/tools/${this.toolId}/items/${this.entityId}`;

    fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    .then(r => {

      if (r.ok) {
        return r.json();
      }
      throw new Error("Network error while getting association");
    })
    .then(association => {

      if (association) {
        this.association = association;
        this.options = association.parameters;
        const rubricId = association.rubricId;

        // Now, get the rubric
        const rubricUrl = `/api/sites/${association.siteId}/rubrics/${rubricId}`;
        fetch(rubricUrl, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
        .then(r => {

          if (r.ok) {
            return r.json();
          }
          throw new Error("Server error while getting rubric");
        })
        .then(rubric => {

          if (this.evaluatedItemId) {
            // Now, get the evaluation
            let evalUrl = `/api/sites/${association.siteId}/rubric-evaluations/tools/${this.toolId}/items/${this.entityId}/evaluations/${this.evaluatedItemId}/owners/${this.evaluatedItemOwnerId}`;
            if (this.isPeerOrSelf) {
              //for permission filters
              evalUrl += "?isPeer=true";
            }
            fetch(evalUrl, {
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            })
            .then(r => {

              if (r.ok) {
                return r.json();
              }

              if (r.status !== 404) {
                throw new Error("Server error while getting evaluation");
              }
            })
            .then(evaluation => {

              if (evaluation) {
                this.evaluation = evaluation;
                this.preview = false;
              } else {
                this.evaluation = { criterionOutcomes: [] };
                this.preview = true;
              }

              // Set the rubric, thus triggering a render
              this.rubric = rubric;
            })
            .catch (error => console.error(error));
          } else {
            this.evaluation = { criterionOutcomes: [] };
            this.preview = true;
            this.rubric = rubric;
          }
        })
        .catch (error => console.error(error));

        if (this.options.hideStudentPreview == null) {
          this.options.hideStudentPreview = false;
        }
      }
    })
    .catch (error => console.error(error));
  }

  openGradePreviewTab(e) {

    e.stopPropagation();
    this.openRubricsTab("rubric-grading-or-preview");
  }

  makeStudentSummary(e) {

    e.stopPropagation();
    this.makeASummary("student", this.siteId);
  }

  makeCriteriaSummary(e) {

    e.stopPropagation();
    this.makeASummary("criteria", this.siteId);
  }
}

const tagName = "sakai-rubric-student";
!customElements.get(tagName) && customElements.define(tagName, SakaiRubricStudent);
