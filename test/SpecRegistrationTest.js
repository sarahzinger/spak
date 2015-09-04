/*jshint expr: true */
import SpecRegistration from "../lib/di/SpecRegistration";
import SpecFromClass from "../lib/di/SpecFromClass";
import SpecFromFn from "../lib/di/SpecFromFn";
import SpecFromValue from "../lib/di/SpecFromValue";
import ActionSpec from "../lib/di/ActionSpec";
import SpecRef from "../lib/di/SpecRef";

// Begin sample modules
class Foo {
    static get inject() {
        return ["bar", "colors"];
    }
}
class FooNoArgs {
    static get inject() {
        return [];
    }
}
class FooNoInject {
}
function createBar(colors) {
    return { colors };
}
createBar.inject = ["colors"];
var colors = ["red", "green", "blue"];
class AddOrder {
    static get inject() {
        return ["theRepo"];
    }
    get componentName() {
        return "addOrder";
    }
}
class RemoveOrder {
    static get inject() {
        return [];
    }
    get componentName() {
        return "RemoveOrder";
    }
}
// End sample modules

describe("SpecRegistration", function () {
    describe("when created", () => {
        beforeEach(() => {
            this.specs = new SpecRegistration();
        });

        it("should implement SpecRegistration", () => {
            this.specs.should.respondTo("writeTo");
        });
    });

    describe("Creating a registration", () => {
        describe("with the 3 base spec types", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new SpecFromClass("foo", Foo),
                    new SpecFromFn("bar", createBar),
                    new SpecFromValue("colors", colors)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from class Foo", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: Foo,
                        args: [{ $ref: "bar" }, { $ref: "colors" }],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `bar` spec'd from fn createBar", () => {
                this.config.should.have.property("bar");
                this.config.bar.should.eql({
                    create: {
                        module: createBar,
                        args: [{ $ref: "colors" }],
                        isConstructor: false
                    }
                });
            });

            it("should create a config with `colors` spec'd from colors array", () => {
                this.config.should.have.property("colors");
                this.config.colors.should.eql({
                    literal: colors
                });
            });
        });

        describe("with specs that override the `args`", () => {
            beforeEach(() => {
                this.colors = ["red"];
                this.specs = new SpecRegistration(
                    new SpecFromValue("newColors", ["orange", "black"]),

                    new SpecFromClass("foo", Foo)
                        .setArg(1, new SpecRef("newColors")),

                    new SpecFromClass("baz", Foo)
                        .setFirstArg("one")
                        .setSecondArg("two")
                        .setThirdArg("three")
                        .setFourthArg("four"),

                    new SpecFromFn("bar", createBar)
                        .setAllArgs(new SpecRef("foo"), new SpecRef("baz"), true)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from class Foo", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: Foo,
                        args: [{ $ref: "bar" }, { $ref: "newColors" }],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `baz` spec'd from class Foo", () => {
                this.config.should.have.property("baz");
                this.config.baz.should.eql({
                    create: {
                        module: Foo,
                        args: ["one", "two", "three", "four"],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `bar` spec'd from fn createBar", () => {
                this.config.should.have.property("bar");
                this.config.bar.should.eql({
                    create: {
                        module: createBar,
                        args: [{ $ref: "foo" }, { $ref: "baz" }, true],
                        isConstructor: false
                    }
                });
            });
        });

        describe("with the classes with no args", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new SpecFromClass("foo", FooNoArgs),
                    new SpecFromClass("bar", FooNoInject)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from class FooNoArgs", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: FooNoArgs,
                        args: [],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `bar` spec'd from class FooNoInject", () => {
                this.config.should.have.property("bar");
                this.config.bar.should.eql({
                    create: {
                        module: FooNoInject,
                        args: [],
                        isConstructor: true
                    }
                });
            });
        });

        describe("with an action spec", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new ActionSpec("PlaceOrder", AddOrder),
                    new ActionSpec(RemoveOrder)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `placeOrder` spec'd from the class AddOrder", () => {
                this.config.should.have.property("placeOrder");
                this.config.placeOrder.should.eql({
                    create: {
                        module: AddOrder,
                        args: [{ $ref: "theRepo"}],
                        isConstructor: true
                    },
                    action: ["placeOrder"]
                });
            });

            it("should create a config with `removeOrder` spec'd from the class RemoveOrder", () => {
                this.config.should.have.property("removeOrder");
                this.config.removeOrder.should.eql({
                    create: {
                        module: RemoveOrder,
                        args: [],
                        isConstructor: true
                    },
                    action: ["removeOrder"]
                });
            });
        });
    });
});
