import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { GLOBAL_ROUTER_EVENTS_TARGET, ROUTER_SLOT_TAG_NAME } from "../../../../../lib/config";
import { Class, GlobalRouterEventKind, IRouterSlot, NavigationEndEvent, RouterSlotEventKind, RoutingInfo } from "../../../../../lib/model";
import { addListener } from "../../../../../lib/util/events";
import { currentPath } from "../../../../../lib/util/url";
import { sharedStyles } from "../../../styles";
import { data } from "../data";

export default class PasswordComponent extends LitElement {

	firstUpdated () {
		super.connectedCallback();

		const $routerSlot = this.shadowRoot!.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;
		$routerSlot.add([
			{
				path: "dialog",
				resolve: (async ({slot, route, match}: RoutingInfo) => {
					const DialogComponent: Class = (await import("../../../../dialog/dialog")).default;
					const $dialog: {parent: IRouterSlot} & HTMLElement = new DialogComponent();
					$dialog.parent = slot;

					function cleanup () {
						if (document.body.contains($dialog)) {
							document.body.removeChild($dialog);
						}
					}
					$dialog.addEventListener("close", () => {
						history.pushState(null, "", "/home/secret/password");
						cleanup();
					});

					const unsub = addListener(GLOBAL_ROUTER_EVENTS_TARGET, GlobalRouterEventKind.PopState, () => {
						if (!currentPath().includes("dialog")) {
							cleanup();
							unsub();
						}
					});

					document.body.appendChild($dialog);
				})
			}
		]);
	}

	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>PasswordComponent</p>
			<span>Resolved password: ${data.secretPassword}</span>
			
			<router-slot></router-slot>
			<router-link path="/home/secret/password/dialog"><button>Dialog</button></router-link>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
