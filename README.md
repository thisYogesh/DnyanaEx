# Dnyana
Dnyana is a javaScript framework.


## Directive bindings
In the Dnyana to bind any directive to any element you must have to tell Dnyana that this element is mapped for directive binding by adding `::map` attribute to an element.

For example: `<input type="text" ::map :value="name"/>`. In this example `:value` is one of the directive in Dnyana and `::map` is the attribute that must be applied on the element if you don't then Dnyana would not detect this element for binding process.

### List Of Directives and Implementation

- `:if`

    ```
    <input ::map :if="expression" type="text"/>
    ```
- `:value`
    ```
    Implementation is as above ^
    ```
- `:src`
    ```
    Implementation is as above ^
    ```
- `:show`
    ```
    Implementation is as above ^
    ```
- `:hide`
    ```
    Implementation is as above ^
    ```
- `:bind`
    ```
    Implementation is as above ^
    ```
- `:html`
    ```
    Implementation is as above ^
    ```
- `:event`
    ```
    <button ::map :event="<event name>:<method name>"> Click Me! <button>
    <button ::map :event="click:listener()"> Click Me! <button>
    
    Pass arguments
    <button ::map :event="click:listener('one', 1+1)"> Click Me! <button>
    
    Pass event object as argument
    <button ::map :event="click:listener($event)"> Click Me! <button>
    ```
- `:class`
    ```
    <span ::map :class="{'classname': condition}"></span>
    ```
- `:loop`
    ```
    <ul>
        <li ::map :loop="collection">
            <span ::map :bind="this"></span>
        </li>
    </ul>
    ```
- `:prop-<property>`
    ```
    <input ::map :prop-readonly="expression" type="text"/>
    ```
- `:attr-<attribute>`
    ```
    <input ::map :attr-id="expression" type="text"/>
    ```
- `:data-<property>`
    ```
    <input ::map :data-name="expression" type="text"/>
    ```
