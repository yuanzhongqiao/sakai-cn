import { SakaiElement } from "./sakai-element.js";
import { html } from "./assets/lit-element/lit-element.js";
import "./sakai-group-picker.js";

/**
 * Handles display and manipulation of permissions for a Sakai tool.
 *
 * Usage, from the Roster tool:
 *
 * <sakai-permissions tool="roster" />
 *
 * Other attributes:
 *
 * bundle-key: Allows to set the bundle name (f.ex: "announcement" or "org.sakaiproject.api.app.messagecenter.bundle.Messages"). By default, it will take the tool attribute value.
 * on-refresh: Allows to set the return page location. By default, it will refresh the current URL.
 * group-reference: Allows to set reference to get permissions from. By default, "/site/${portal.siteId}". Order is important. This attribute must be set before the tool attribute.
 * disabled-groups: Disables all other options apart form "Site" in the Site/Group selector. By default, false (groups are shown). Order is important. This attribute must be set before the tool attribute.
 *
 * Usage, from the Podcasts tool:
 *
 * <sakai-permissions group-reference="/content/group/%SITE_ID%/Podcasts/" disabled-groups=true tool="content" bundle-key="org.sakaiproject.api.podcasts.bundle.Messages" />
 *
 * This component needs to be able to lookup a tool's translations, and this happens via the
 * sakai-i18n.js module, loading the translations from a Sakai web service. The translations need
 * to be jarred and put in TOMCAT/lib, and the permission translation keys need to start with "perm-",
 * eg: perm-TOOLPERMISSION.
 *
 * Example:
 *
 * perm-roster.viewallmembers = View all participants
 * perm-roster.viewhidden = View hidden participants
 * perm-roster.export = Export roster
 * perm-roster.viewgroup = View groups
 *
 * @author Adrian Fish <adrian.r.fish@gmail.com>
 */
class SakaiPermissions extends SakaiElement {

  constructor() {

    super();

    this.available;
    this.on;
    this.roles;
    this.roleNameMappings;
    this.groups = [];
    this.groupReference = `/site/${portal.siteId}`;

    this.loadTranslations("permissions-wc").then(i18n => {

      this.loadTranslations(this.bundleKey ? this.bundleKey : this.tool).then(tool => {

        Object.keys(tool).filter(k => k.startsWith("perm-")).forEach(k => i18n[k.substring(5)] = tool[k]);
        this.i18n = i18n;
        this.requestUpdate();
      });
    });
  }

  static get properties() {

    return {
      tool: { type: String },
      groupReference: { attribute: 'group-reference', type: String },
      disableGroups: { attribute: 'disabled-groups', type: Boolean },
      bundleKey: { attribute: 'bundle-key', type: String },
      onRefresh: { attribute: 'on-refresh', type: String },
      fireEvent: { attribute: "fire-event", type: Boolean },
      roles: { attribute: false, type: Array },
      groups: { attribute: false, type: Array },
      error: { attribute: false, type: String },
    };
  }

  set tool(newValue) {

    this._tool = newValue;
    this.loadPermissions();
  }

  get tool() { return this._tool; }

  _handleDescriptionClick(e) {

    e.preventDefault();

    const all = e.target.closest('tr').querySelectorAll('input');
    const checked = e.target.closest('tr').querySelectorAll('input:checked');

    if (checked.length < all.length || checked.length === 0) {
      all.forEach(i => i.checked = true);
    } else if (checked.length === all.length) {
      all.forEach(i => i.checked = false);
    }
  }

  _handlePermissionMouseEnter() {
    this.querySelectorAll('.permissions-table td.checkboxCell').forEach(td => td.classList.add('rowHover'));
  }

  _handlePermissionMouseLeave() {
    this.querySelectorAll('.permissions-table td.checkboxCell').forEach(td => td.classList.remove('rowHover'));
  }

  _handlePermissionChange(e) {
    e.target.closest('td').classList.toggle('active', e.target.checked);
  }

  _handleRoleHover(e, type) {

    const role = e.target.dataset.role.replace(".", "\\.");
    this.querySelectorAll(`td.${role.replace(" ", "_")}-checkbox-cell`).forEach(cell => {
      cell.classList.toggle('rowHover', type === "mouseenter");
    });
  }

  _handleRoleMouseEnter(e) {
    this._handleRoleHover(e, "mouseenter");
  }

  _handleRoleMouseLeave(e) {
    this._handleRoleHover(e, "mouseleave");
  }

  _handleRoleClick(e) {

    e.preventDefault();

    const role = e.target.dataset.role.replace(".", "\\.");

    const anyChecked = this.querySelectorAll(`.permissions-table .${role.replace(" ", "_")}-checkbox-cell input:checked:not(:disabled)`).length > 0;
    this.querySelectorAll(`.permissions-table .${role.replace(" ", "_")}-checkbox-cell input:not(:disabled)`).forEach(i => i.checked = !anyChecked);
  }

  _handlePermissionClick(e) {

    e.preventDefault();

    const checked = this.querySelectorAll('.permissions-table input:checked');

    this.querySelectorAll('.permissions-table input').forEach(input => {
      input.checked = checked.length === 0;
    });
  }

  firstUpdated() {

    // Save the default selected
    this.querySelectorAll('.permissions-table :checked').forEach(el => {
      el.closest('td').classList.add('defaultSelected');
    });
  }

  shouldUpdate() {
    return this.i18n;
  }

  render() {

    if (this.roles) {
      return html`

        ${this.groups && this.groups.length > 0 ? html`
          <div>
            <label for="permissons-group-picker">${this.i18n["per.lis.selectgrp"]}</label>
            <sakai-group-picker id="permissions-group-picker" groups="${JSON.stringify(this.groups)}" @group-selected=${this.groupSelected}></sakai-group-picker>
          </div>
        ` : ""}
        <div class="mb-1 pt-3">
          <input type="button" value="${this.i18n["per.lis.restoredef"]}" aria-label="${this.i18n.undo}" @click=${this.resetPermissions} />
        </div>
        <table class="permissions-table table table-hover table-striped listHier checkGrid specialLink"
            cellspacing="0"
            summary="${this.i18n["per.lis"]}"
            border="0">
          <tr>
            <th id="permission" @mouseenter=${this._handlePermissionMouseEnter} @mouseleave=${this._handlePermissionMouseLeave}>
              <button class="btn btn-transparent" title="${this.i18n["per.lis.head.title"]}" @click=${this._handlePermissionClick}>${this.i18n["per.lis.head"]}</button>
            </th>
            ${this.roles.map(role => html`
            <th class="role" data-role="${role}" @mouseenter=${this._handleRoleMouseEnter} @mouseleave=${this._handleRoleMouseLeave}>
              <button class="btn btn-transparent" title="${this.i18n["per.lis.role.title"]}" data-role="${role}" @click=${this._handleRoleClick}>${this.roleNameMappings[role]}</button>
            </th>
            `)}
          </tr>
          ${this.available.map(perm => html`
          <tr>
            <td class="text-start text-nowrap permissionDescription unclicked" scope="row">
              <button class="btn btn-transparent" title="${this.i18n["per.lis.perm.title"]}" @click=${this._handleDescriptionClick}>
                ${this.i18n[perm]}
              </button>
            </td>
            ${this.roles.map(role => html`
            <td class="${role.replace(" ", "_")}-checkbox-cell checkboxCell">
              <label for="${role}:${perm}" class="sr-only">
                <span>${this.i18n["gen.enable"]} ${role}</span>
              </label>
              <input type="checkbox"
                  class="sakai-permission-checkbox"
                  aria-label="${this.i18n["gen.enable"]} ${role}"
                  .checked=${this.on[role].includes(perm)}
                  data-role="${role}"
                  data-perm="${perm}"
                  @change=${this._handlePermissionChange}
                  id="${role}:${perm}"/>
            </td>
            `)}
          </tr>
          `)}
        </table>
        <div class="act">
          <input type="button" class="active" value="${this.i18n["gen.sav"]}" aria-label="${this.i18n["gen.sav"]}" @click="${this.savePermissions}"/>
          <input type="button" value="${this.i18n["gen.can"]}" aria-label="${this.i18n["gen.can"]}" @click="${this._completePermissions}"/>
          <span id="${this.tool}-failure-message" class="permissions-save-message" style="display: none;">${this.i18n["per.error.save"]}</span>
        </div>
      `;
    } else if (this.error) {
      return html`<div class="sak-banner-error">${this.i18n.alert_permission}</div>`;
    }

    return html`Waiting for permissions`;
  }

  loadPermissions() {

    fetch(`/direct/permissions/${portal.siteId}/getPerms/${this.tool}.json?ref=${this.groupReference}`, {cache: "no-cache", credentials: "same-origin"})
      .then(res => {

        if (res.status === 403) {
          this.error = true;
        } else {
          this.error = false;
          return res.json();
        }
      })
      .then(data => {

        this.on = data.on;
        this.available = data.available;
        if (!this.disableGroups) {
          this.groups = data.groups;
        }
        this.roles = Object.keys(this.on);
        this.roleNameMappings = data.roleNameMappings;
      })
      .catch(error => console.error(`Failed to load permissions for tool ${this.tool}`, error));
  }

  savePermissions() {

    document.body.style.cursor = "wait";

    const boxes = this.querySelectorAll('.permissions-table input[type="checkbox"]');
    const params = `ref=${this.groupReference}&${  Array.from(boxes).reduce((acc, b) => {

      if (b.checked) {
        return `${acc  }${encodeURIComponent(b.id)}=true&`;
      }
      return `${acc  }${encodeURIComponent(b.id)}=false&`;

    }, "")}`;

    fetch(`/direct/permissions/${portal.siteId}/setPerms`, {method: "POST", credentials: "same-origin", body: new URLSearchParams(params), timeout: 30000})
      .then(res => {

        if (res.ok) {
          this._completePermissions();
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .catch(error => {

        document.querySelector(`#${this.tool.replace('.', '\\.')}-failure-message`).style.display = "inline-block";
        console.error(`Failed to save permissions for tool ${this.tool}`, error);
      })
      .finally(() => document.body.style.cursor = "default");
  }

  resetPermissions() {

    this.updateComplete.then(() => {

      const inputs = this.renderRoot.querySelectorAll("input[type='checkbox']");
      inputs.forEach(elem => {

        const role = elem.getAttribute('data-role');
        const perm = elem.getAttribute('data-perm');
        if (role && perm) {
          const elemChanged = (elem.checked != this.on[role].includes(perm));
          elem.checked = this.on[role].includes(perm);
          if (elemChanged) {
            elem.dispatchEvent(new Event("change"));
          }
        }
      });
    });
  }

  _completePermissions() {

    if (this.fireEvent) {
      this.dispatchEvent(new CustomEvent("permissions-complete"));
    } else if (this.onRefresh) {
      window.location.href = this.onRefresh;
    } else {
      window.location.reload();
    }
  }

  groupSelected(e) {

    this.groupReference = e.detail.value;
    this.loadPermissions();
  }
}

const tagName = "sakai-permissions";
!customElements.get(tagName) && customElements.define(tagName, SakaiPermissions);
