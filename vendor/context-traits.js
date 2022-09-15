/* 
 * Context Traits v0.0.1,
 * https://github.com/tagae/context-traits,
 * Copyright © 2012—2015, 04:23 © 2012—2015 UCLouvain,
 * Licensed under Apache Licence, Version 2.0
 */ 

(function() {
  var ActivationAgePolicy, Adaptation, Context, Discovery, Manager, Namespace, Policy, base, contexts, ensureObject, exports, findScriptHome, strategies, traceableMethod, traceableTrait, traits,
    hasProp = {}.hasOwnProperty;

  ensureObject = function(name, file, path) {
    var attribute, j, len, object;
    if (path == null) {
      path = [];
    }
    object = this[name];
    if (object == null) {
      if (typeof require !== "undefined" && require !== null) {
        object = require(file);
        for (j = 0, len = path.length; j < len; j++) {
          attribute = path[j];
          object = object[attribute];
        }
        return this[name] = object;
      } else {
        throw new Error("Required object '" + name + "' of library '" + file + "' not found");
      }
    }
  };

  ensureObject('_', 'underscore');

  ensureObject('Trait', 'traits', ['Trait']);

  if ((base = Function.prototype).inheritFrom == null) {
    base.inheritFrom = function(parent) {
      this.prototype = new parent();
      return this;
    };
  }

  Array.prototype.top = function() {
    return this[this.length - 1];
  };

  Context = function(obj) {
    var ref;
    this.activationCount = 0;
    this.adaptations = [];
    this.manager = ((ref = contexts.Default) != null ? ref.manager : void 0) || new Manager();
    this.name = (function() {
      if (obj != null) {
        return obj.name;
      }
    });
    this.slice = (function() {
      if (typeof obj.slice === 'undefined') {
        return 'context.default.' + obj.name;
      } else {
        return obj.slice + '.' + obj.name;
      }
    });
    return this;
  };

  Adaptation = function(context, object, trait) {
    this.context = context;
    this.object = object;
    this.trait = trait;
    return this;
  };

  Manager = function() {
    this.adaptations = [];
    this.invocations = [];
    this.policy = new ActivationAgePolicy();
    this.totalActivations = 0;
    return this;
  };

  Policy = function() {
    return this;
  };

  Discovery = function() {
    this.exportingBehavior = [];
    this.volitileContexts = [];
    return this;
  };

  _.extend(Context.prototype, {
    activate: function() {
      if (++this.activationCount === 1) {
        this.activationStamp = ++this.manager.totalActivations;
        this.activateAdaptations();
      }
      return this;
    },
    deactivate: function() {
      if (this.activationCount > 0) {
        if (--this.activationCount === 0) {
          this.deactivateAdaptations();
          delete this.activationStamp;
        }
      } else {
        throw new Error('Cannot deactivate inactive context');
      }
      return this;
    },
    isActive: function() {
      return this.activationCount > 0;
    }
  });

  strategies = {
    compose: function(adaptation, trait) {
      var name, propdesc, resultingTrait;
      resultingTrait = Trait.compose(adaptation.trait, trait);
      for (name in resultingTrait) {
        if (!hasProp.call(resultingTrait, name)) continue;
        propdesc = resultingTrait[name];
        if (propdesc.conflict) {
          throw new Error(("Property '" + name + "' already adapted for ") + adaptation.object + " in " + adaptation.context);
        }
      }
      return resultingTrait;
    },
    preserve: function(adaptation, trait) {
      return Trait.override(adaptation.trait, trait);
    },
    override: function(adaptation, trait) {
      return Trait.override(trait, adaptation.trait);
    },
    prevent: function(adaptation, trait) {
      throw new Error(adaptation.object + " already adapted in " + adaptation.context);
    }
  };

  _.extend(Context.prototype, {
    adapt: function(object, trait) {
      if (!(object instanceof Object)) {
        throw new Error("Values of type " + (typeof object) + " cannot be adapted.");
      }
      contexts.Default.addAdaptation(object, Trait(object), strategies.preserve);
      return this.addAdaptation(object, trait, strategies.compose);
    },
    addAdaptation: function(object, trait, strategy) {
      var adaptation;
      trait = traceableTrait(trait, object);
      adaptation = this.adaptationFor(object);
      if (adaptation) {
        adaptation.trait = strategy(adaptation, trait);
        if (this.isActive()) {
          this.manager.updateBehaviorOf(object);
        }
      } else {
        trait = Trait.compose(trait, traits.Extensible);
        adaptation = new Adaptation(this, object, trait);
        this.adaptations.push(adaptation);
        if (this.isActive()) {
          this.manager.deployAdaptation(adaptation);
        }
      }
      return this;
    },
    adaptationFor: function(object) {
      return _.find(this.adaptations, function(adaptation) {
        return adaptation.object === object;
      });
    },
    activateAdaptations: function() {
      var adaptation, j, len, ref, results;
      ref = this.adaptations;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        adaptation = ref[j];
        results.push(this.manager.deployAdaptation(adaptation));
      }
      return results;
    },
    deactivateAdaptations: function() {
      var adaptation, j, len, ref, results;
      ref = this.adaptations;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        adaptation = ref[j];
        results.push(this.manager.withdrawAdaptation(adaptation));
      }
      return results;
    }
  });

  _.extend(Manager.prototype, {
    deployAdaptation: function(adaptation) {
      this.adaptations.push(adaptation);
      return this.updateBehaviorOf(adaptation.object);
    },
    withdrawAdaptation: function(adaptation) {
      var i;
      i = this.adaptations.indexOf(adaptation);
      if (i === -1) {
        throw new Error("Attempt to withdraw unmanaged adaptation");
      }
      this.adaptations.splice(i, 1);
      return this.updateBehaviorOf(adaptation.object);
    },
    updateBehaviorOf: function(object) {
      this.adaptationChainFor(object)[0].deploy();
      return this;
    },
    adaptationChainFor: function(object) {
      var relevantAdaptations;
      relevantAdaptations = _.filter(this.adaptations, function(adaptation) {
        return adaptation.object === object;
      });
      if (relevantAdaptations.length === 0) {
        throw new Error("No adaptations found for " + object);
      }
      return this.policy.order(relevantAdaptations);
    }
  });

  _.extend(Adaptation.prototype, {
    deploy: function() {
      return _.extend(this.object, Object.create({}, this.trait));
    },
    toString: function() {
      return "Adaptation for " + this.object + " in " + this.context;
    },
    equivalent: function(other) {
      return this.context === other.context && this.object === other.object && Trait.eqv(this.trait, other.trait);
    }
  });

  traits = {};

  traits.Extensible = Trait({
    proceed: function() {
      var alternatives, args, index, invocations, manager, method, name, object, ref;
      manager = contexts.Default.manager;
      invocations = manager.invocations;
      if (invocations.length === 0) {
        throw new Error("Proceed must be called from an adaptation");
      }
      ref = invocations.top(), object = ref[0], method = ref[1], name = ref[2], args = ref[3];
      args = arguments.length === 0 ? args : arguments;
      alternatives = manager.orderedMethods(object, name);
      index = alternatives.indexOf(method);
      if (index === -1) {
        throw new Error("Cannot proceed from an inactive adaptation");
      }
      if (index + 1 === alternatives.length) {
        throw new Error("Cannot proceed further");
      }
      return alternatives[index + 1].apply(this, args);
    }
  });

  traceableMethod = function(object, name, method) {
    var wrapper;
    wrapper = function() {
      var invocations;
      invocations = contexts.Default.manager.invocations;
      invocations.push([object, wrapper, name, arguments]);
      try {
        return method.apply(this, arguments);
      } finally {
        invocations.pop();
      }
    };
    return wrapper;
  };

  traceableTrait = function(trait, object) {
    var name, newTrait, propdesc;
    newTrait = Trait.compose(trait);
    for (name in newTrait) {
      if (!hasProp.call(newTrait, name)) continue;
      propdesc = newTrait[name];
      if (_.isFunction(propdesc.value)) {
        propdesc.value = traceableMethod(object, name, propdesc.value);
      }
    }
    return newTrait;
  };

  _.extend(Manager.prototype, {
    orderedMethods: function(object, name) {
      var adaptation, adaptations, j, len, results;
      adaptations = this.adaptationChainFor(object);
      results = [];
      for (j = 0, len = adaptations.length; j < len; j++) {
        adaptation = adaptations[j];
        results.push(adaptation.trait[name].value);
      }
      return results;
    }
  });

  _.extend(Policy.prototype, {
    order: function(adaptations) {
      var self;
      self = this;
      return adaptations.sort(function(adaptation1, adaptation2) {
        if (adaptation1.object !== adaptation2.object) {
          throw new Error("Refusing to order adaptations of different objects");
        }
        return self.compare(adaptation1, adaptation2);
      });
    },
    compare: function(adaptation1, adaptation2) {
      throw new Error("There is no criterium to order adaptations");
    },
    toString: function() {
      return this.name() + ' policy';
    },
    name: function() {
      return 'anonymous';
    }
  });

  ActivationAgePolicy = function() {
    Policy.call(this);
    return this;
  };

  ActivationAgePolicy.inheritFrom(Policy);

  _.extend(ActivationAgePolicy.prototype, {
    compare: function(adaptation1, adaptation2) {
      return adaptation1.context.activationAge() - adaptation2.context.activationAge();
    },
    name: function() {
      return 'activation age';
    }
  });

  _.extend(Context.prototype, {
    activationAge: function() {
      return this.manager.totalActivations - this.activationStamp;
    }
  });

  Namespace = function(name, parent) {
    if (parent == null) {
      parent = null;
    }
    if (!name) {
      throw new Error("Namespaces must have a name");
    }
    this.name = name;
    this.parent = parent;
    if (!parent) {
      this.home = findScriptHome();
    }
    return this;
  };

  _.extend(Namespace.prototype, {
    root: function() {
      if (this.parent != null) {
        return this.parent.root();
      } else {
        return this;
      }
    },
    path: function() {
      var path;
      if (this.parent != null) {
        path = this.parent.path();
        path.push(this.name);
        return path;
      } else {
        return [this.name];
      }
    },
    normalizePath: function(path) {
      if (_.isString(path)) {
        return path = path.split('.');
      } else if (_.isArray(path)) {
        return path;
      } else {
        throw new Error("Invalid path specification");
      }
    },
    ensure: function(path) {
      var j, len, name, namespace;
      path = this.normalizePath(path);
      namespace = this;
      for (j = 0, len = path.length; j < len; j++) {
        name = path[j];
        if (namespace[name] == null) {
          namespace[name] = new Namespace(name, namespace);
        }
        namespace = namespace[name];
      }
      return namespace;
    },
    add: function(properties) {
      return _.extend(this, properties);
    },
    load: function(path, options) {
      var failure, success;
      success = options.success || (function() {});
      failure = options.failure || (function() {});
      path = this.normalizePath(path);
      if (typeof document !== "undefined" && document !== null) {
        return this.loadInBrowser(path, success, failure);
      } else {
        throw new Error("Loading of context modules not supported in current JavaScript platform.");
      }
    },
    loadInBrowser: function(path, success, failure) {
      var target, url;
      if (typeof $ === "undefined" || $ === null) {
        throw new Error("Context module loading depends on jQuery");
      }
      target = this;
      url = target.root().home + (target.path().concat(path)).join('/') + '.js';
      return $.ajax({
        url: url,
        dataType: "text",
        success: function(data, textStatus, jqXHR) {
          var error, leaf, origExports;
          try {
            if (window.hasOwnProperty('exports')) {
              origExports = window.exports;
            }
            window.exports = {};
            $.globalEval(data);
            leaf = target.ensure(path);
            leaf.add(window.exports);
            if (origExports != null) {
              window.exports = origExports;
            } else {
              delete window.exports;
            }
            console.log('Loaded ' + url);
            return success();
          } catch (_error) {
            error = _error;
            return failure(error);
          }
        },
        error: function(jqXHR, status, error) {
          console.log("Failed to load " + url + " (" + status + "): " + error);
          return failure(error);
        }
      });
    }
  });

  _.extend(Context.prototype, {
    path: function(from) {
      var i, j, keys, len, p, subspace, values;
      if (from == null) {
        from = contexts;
      }
      keys = _.keys(from);
      values = _.values(from);
      i = values.indexOf(this);
      if (i !== -1) {
        return [keys[i]];
      } else {
        for (i = j = 0, len = values.length; j < len; i = ++j) {
          subspace = values[i];
          if (subspace instanceof Namespace && keys[i] !== 'parent') {
            p = this.path(subspace);
            if (p) {
              p.unshift(keys[i]);
              return p;
            }
          }
        }
        return false;
      }
    },
    name: function() {
      var path;
      path = this.path();
      if (path) {
        return path.join('.');
      } else {
        return 'anonymous';
      }
    },
    toString: function() {
      return this.name() + ' context';
    }
  });

  findScriptHome = function() {
    var error, j, len, line, matches, ref, trace;
    try {
      throw new Error;
    } catch (_error) {
      error = _error;
      trace = error.stack || error.stacktrace;
      if (trace) {
        ref = trace.split('\n');
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          matches = /(http|file):\/\/[^\/]*(\/.*\/)[^\/]*\.js/.exec(line);
          if (matches != null) {
            return matches[2];
          }
        }
      } else if (error.sourceURL) {
        throw new Error('TODO: error.sourceURL not supported yet.');
      } else {
        throw new Error('Could not determine script home directory.');
      }
    }
    return null;
  };

  contexts = new Namespace('contexts');

  contexts.Default = new Context('default');

  contexts.Default.activate();

  if (typeof exports === "undefined" || exports === null) {
    exports = this;
  }

  exports.Context = Context;

  exports.Namespace = Namespace;

  exports.Policy = Policy;

  exports.Trait = Trait;

  exports.contexts = contexts;

}).call(this);
