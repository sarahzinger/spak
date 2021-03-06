import Q from "q";

export default class AppComponents {
    constructor(...listOfComponents) {
        this._list = listOfComponents;
    }

    onAppConfig(config) {
        return this._list.forEach(this._invokeHook("onAppConfig", config));
    }
    onBeforeAppBootstrapped(bootstrapper) {
        return this._list.forEach(this._invokeHook("onBeforeAppBootstrapped", bootstrapper));
    }
    register(specs) {
        return Q.all(this._list.map(
            (component) => this._registerComponent(component, specs)
        ));
    }
    onAppComponentsRegistered(bootstrapper) {
        return this._list.forEach(this._invokeHook("onAppComponentsRegistered", bootstrapper));
    }
    onAppBootstrapped(container) {
        return this._list.forEach(this._invokeHook("onAppBootstrapped", container));
    }

    _registerComponent(component, specs) {
        return Q(component.register(specs)).then((registration = {}) => (
            specs.register({ name: component.metadata.name, registration })
        ));
    }

    _invokeHook(hook, ...args) {
        return (component) => {
            if (typeof component[hook] === "function") {
                return component[hook](...args);
            }
        };
    }
}
