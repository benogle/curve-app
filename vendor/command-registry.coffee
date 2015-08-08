# From Atom: https://github.com/atom/atom/blob/master/src/command-registry.coffee

{Emitter, Disposable, CompositeDisposable} = require 'event-kit'
{calculateSpecificity, validateSelector} = require 'clear-cut'

SequenceCount = 0

# Public: Associates listener functions with commands in a context-sensitive way
# using CSS selectors.
module.exports =
class CommandRegistry
  constructor: (@rootNode) ->
    @registeredCommands = {}
    @selectorBasedListenersByCommandName = {}
    @inlineListenersByCommandName = {}
    @emitter = new Emitter

  destroy: ->
    for commandName of @registeredCommands
      window.removeEventListener(commandName, @handleCommandEvent, true)
    return

  # Public: Add one or more command listeners associated with a selector.
  #
  # * `target` A {String} containing a CSS selector or a DOM element. If you
  #   pass a selector, the commands will be globally associated with all
  #   matching elements. The `,` combinator is not currently supported.
  #   If you pass a DOM element, the command will be associated with just that
  #   element.
  # * `commands` An {Object} mapping command names like `user:insert-date` to
  #   listener {Function}s.
  #
  # Returns a {Disposable} on which `.dispose()` can be called to remove the
  # added command handler(s).
  add: (target, commandName, callback) ->
    if typeof commandName is 'object'
      commands = commandName
      disposable = new CompositeDisposable
      for commandName, callback of commands
        disposable.add @add(target, commandName, callback)
      return disposable

    if typeof callback isnt 'function'
      throw new Error("Can't register a command with non-function callback.")

    if typeof target is 'string'
      validateSelector(target)
      @addSelectorBasedListener(target, commandName, callback)
    else
      @addInlineListener(target, commandName, callback)

  addSelectorBasedListener: (selector, commandName, callback) ->
    @selectorBasedListenersByCommandName[commandName] ?= []
    listenersForCommand = @selectorBasedListenersByCommandName[commandName]
    listener = new SelectorBasedListener(selector, callback)
    listenersForCommand.push(listener)

    @commandRegistered(commandName)

    new Disposable =>
      listenersForCommand.splice(listenersForCommand.indexOf(listener), 1)
      delete @selectorBasedListenersByCommandName[commandName] if listenersForCommand.length is 0

  addInlineListener: (element, commandName, callback) ->
    @inlineListenersByCommandName[commandName] ?= new WeakMap

    listenersForCommand = @inlineListenersByCommandName[commandName]
    unless listenersForElement = listenersForCommand.get(element)
      listenersForElement = []
      listenersForCommand.set(element, listenersForElement)
    listener = new InlineListener(callback)
    listenersForElement.push(listener)

    @commandRegistered(commandName)

    new Disposable ->
      listenersForElement.splice(listenersForElement.indexOf(listener), 1)
      listenersForCommand.delete(element) if listenersForElement.length is 0

  # Public: Simulate the dispatch of a command on a DOM node.
  #
  # This can be useful for testing when you want to simulate the invocation of a
  # command on a detached DOM node. Otherwise, the DOM node in question needs to
  # be attached to the document so the event bubbles up to the root node to be
  # processed.
  #
  # * `target` The DOM node at which to start bubbling the command event.
  # * `commandName` {String} indicating the name of the command to dispatch.
  dispatch: (target, commandName, detail) ->
    event = new CustomEvent(commandName, {bubbles: true, detail})
    eventWithTarget = Object.create event,
      target: value: target
      preventDefault: value: ->
      stopPropagation: value: ->
      stopImmediatePropagation: value: ->
    @handleCommandEvent(eventWithTarget)

  onWillDispatch: (callback) ->
    @emitter.on 'will-dispatch', callback

  getSnapshot: ->
    snapshot = {}
    for commandName, listeners of @selectorBasedListenersByCommandName
      snapshot[commandName] = listeners.slice()
    snapshot

  restoreSnapshot: (snapshot) ->
    @selectorBasedListenersByCommandName = {}
    for commandName, listeners of snapshot
      @selectorBasedListenersByCommandName[commandName] = listeners.slice()
    return

  handleCommandEvent: (originalEvent) =>
    propagationStopped = false
    immediatePropagationStopped = false
    matched = false
    currentTarget = originalEvent.target

    syntheticEvent = Object.create originalEvent,
      eventPhase: value: Event.BUBBLING_PHASE
      currentTarget: get: -> currentTarget
      preventDefault: value: ->
        originalEvent.preventDefault()
      stopPropagation: value: ->
        originalEvent.stopPropagation()
        propagationStopped = true
      stopImmediatePropagation: value: ->
        originalEvent.stopImmediatePropagation()
        propagationStopped = true
        immediatePropagationStopped = true
      abortKeyBinding: value: ->
        originalEvent.abortKeyBinding?()

    @emitter.emit 'will-dispatch', syntheticEvent

    loop
      listeners = @inlineListenersByCommandName[originalEvent.type]?.get(currentTarget) ? []
      if currentTarget.webkitMatchesSelector?
        selectorBasedListeners =
          (@selectorBasedListenersByCommandName[originalEvent.type] ? [])
            .filter (listener) -> currentTarget.webkitMatchesSelector(listener.selector)
            .sort (a, b) -> a.compare(b)
        listeners = listeners.concat(selectorBasedListeners)

      matched = true if listeners.length > 0

      for listener in listeners
        break if immediatePropagationStopped
        listener.callback.call(currentTarget, syntheticEvent)

      break if currentTarget is window
      break if propagationStopped
      currentTarget = currentTarget.parentNode ? window

    matched

  commandRegistered: (commandName) ->
    unless @registeredCommands[commandName]
      window.addEventListener(commandName, @handleCommandEvent, true)
      @registeredCommands[commandName] = true

class SelectorBasedListener
  constructor: (@selector, @callback) ->
    @specificity = calculateSpecificity(@selector)
    @sequenceNumber = SequenceCount++

  compare: (other) ->
    other.specificity - @specificity  or
      other.sequenceNumber - @sequenceNumber

class InlineListener
  constructor: (@callback) ->
