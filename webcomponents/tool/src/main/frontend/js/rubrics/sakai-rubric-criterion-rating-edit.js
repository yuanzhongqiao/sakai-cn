import {RubricsElement} from "./rubrics-element.js";
import {html} from "/webcomponents/assets/lit-element/lit-element.js";
import {ifDefined} from '/webcomponents/assets/lit-html/directives/if-defined.js';
import {tr} from "./sakai-rubrics-language.js";

export class SakaiRubricCriterionRatingEdit extends RubricsElement {

  static get properties() {

    return {
      rating: { type: Object },
      criterionId: { attribute: "criterion-id", type: String },
      removable: {attribute: "removable", type: Boolean},
      isLocked: { attribute: "is-locked", type: Boolean },
      minpoints: Number,
      maxpoints:  Number,
    };
  }

  set rating(newValue) {

    const oldValue = this._rating;
    this._rating = newValue;
    this.requestUpdate("rating", oldValue);
    if (this._rating.new) {
      this.updateComplete.then(() => this.querySelector(".edit").click() );
    }
  }

  get rating() { return this._rating; }

  render() {

    return html`
      <a tabindex="0" role="button" class="linkStyle edit fa fa-edit" @focus="${this.onFocus}" @keyup="${this.openEditWithKeyboard}" @click="${this.editRating}" title="${tr("edit_rating")} ${this.rating.title}" aria-label="${tr("edit_rating")} ${this.rating.title}" href="#"></a>

      <div id="edit_criterion_rating_${this.rating.id}" class="popover rating-edit-popover bottom rubrics-popover">
        <div class="arrow-1"></div>
        <div class="popover-title">
          <div class="buttons act">
            <button class="active btn-xs save" title="${tr("save")} ${this.rating.title}" @click="${this.saveEdit}">
              <sr-lang key="save">Save</sr-lang>
            </button>
            ${!this.isLocked ? html`
              <button class="btn-link delete" title="${this.removeButtonTitle()}" ?disabled="${!this.removable}" @click="${this.deleteRating}"><sr-lang key="remove_label" /></button>
            ` : ""}
            <button class="btn btn-link btn-xs cancel" title="${tr("cancel")}" @click="${this.cancelEdit}">
              <sr-lang key="cancel"></sr-lang>
            </button>
          </div>
        </div>
        <div class="popover-content form">
          <div class="first-row">
              <div class="form-group title">
                <label class="label-rubrics" for="rating-title-${this.rating.id}"><sr-lang key="rating_title" /></label>
                <input type="text" id="rating-title-${this.rating.id}" class="form-control" .value="${this.rating.title}" maxlength="255">
              </div>
              <div class="form-group points ${this.isLocked ? "d-none" : ""}">
                <label class="label-rubrics" for="rating-points-${this.rating.id}"><sr-lang key="points" /></label>
                <input type="number" id="rating-points-${this.rating.id}" class="form-control hide-input-arrows" name="quantity" .value="${this.rating.points}" min="${ifDefined(this.minpoints)}" max="${ifDefined(this.maxpoints)}" />
              </div>
          </div>
          <div class="form-group">
            <label class="label-rubrics" for="rating-description-${this.rating.id}"><sr-lang key="rating_description" /></label>
            <textarea name="" id="rating-description-${this.rating.id}" class="form-control">${this.rating.description}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  onFocus(e) {

    e.target.closest('.criterion-row').classList.add("focused");
  }

  closeOpen() {
    $('.show-tooltip .cancel').click();
  }

  editRating(e) {

    e.preventDefault();
    e.stopPropagation();

    if (!this.classList.contains("show-tooltip")) {
      this.closeOpen();
      this.classList.add("show-tooltip");
      const popover = $(`#edit_criterion_rating_${this.rating.id}`);

      popover[0].style.top = `${e.target.offsetTop + 20  }px`;
      popover[0].style.left = `${e.target.offsetLeft - popover.width() / 2  }px`;

      popover.show();
      const titleinput = this.querySelector('[type="text"]');
      titleinput.focus();
      titleinput.setSelectionRange(0, titleinput.value.length);

    } else {
      this.hideToolTip();
    }
  }

  hideToolTip() {

    $(`#edit_criterion_rating_${this.rating.id}`).hide();
    this.classList.remove("show-tooltip");
  }

  resetFields() {

    document.getElementById(`rating-title-${this.rating.id}`).value = this.rating.title;
    document.getElementById(`rating-points-${this.rating.id}`).value = this.rating.points;
    document.getElementById(`rating-description-${this.rating.id}`).value = this.rating.description;
  }

  cancelEdit(e) {

    e.stopPropagation();
    this.hideToolTip();
    this.resetFields();
  }

  saveEdit(e) {

    e.stopPropagation();

    this.rating.title = document.getElementById(`rating-title-${this.rating.id}`).value;

    if (!this.isLocked) {

      const points = parseFloat(document.getElementById(`rating-points-${this.rating.id}`).value);
      // Check points value. Blank breaks things.
      if (isFinite(points)) {
        // Round user input to two digits.
        this.rating.points = points.toFixed(2);
      } // Else, previous saved score or default one will be used.
    }

    this.rating.description = document.getElementById(`rating-description-${this.rating.id}`).value;
    this.rating.criterionId = this.criterionId;

    this.resetFields();

    this.dispatchEvent(new CustomEvent('save-rating', { detail: { rating: this.rating, criterionId: this.criterionId }}));
    this.hideToolTip();
  }

  deleteRating(e) {

    e.stopPropagation();

    this.rating.criterionId = this.criterionId;
    this.dispatchEvent(new CustomEvent('delete-rating', {detail: this.rating}));
    this.hideToolTip();
  }

  openEditWithKeyboard(e) {

    if (e.keyCode == 32) {
      this.editRating(e);
    }
  }

  removeButtonTitle() {
    if (this.removable) {
      return `${tr("remove_label")} ${this.rating.title}`;
    }
    return tr("remove_rating_disabled");
  }
}

customElements.define("sakai-rubric-criterion-rating-edit", SakaiRubricCriterionRatingEdit);
