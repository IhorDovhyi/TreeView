import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
"use strict";
import {
    empty,
    plus,
    minus,
    inputSelector,
    spanSelector,
    addButtonSelector,
    deleteButtonSelector,
    expandButtonSelector,
    ulSelector,
    liSelector,
    parentUlId,
    buttonElevent,
    spanElement,
    inputElement,
    topInputId,
    inputPlaceholder,
    liElement,
    ulElement,
    eventClick,
    buttonClassAdd,
    buttonClassDelete,
    buttonClassShow,
    buttonClassHide,
    inputAreaClass,
    inputAreaButtonClass,
    displayNone,
    displayInlineBlock,
    displayBlock,
    arrowDown,
    arrowUp,
    rootSelector
} from "./variables.js";

let getElementById = (elementId) => {
    return document.getElementById(elementId)
}

let createElement = (element) => {
    return document.createElement(element)
}

const topInput = getElementById(topInputId);
const root = getElementById(rootSelector);
let dataTasks = [];

let parseLocalStorage = () => {
    let arr = [];
    let keys = Object.keys(localStorage);
    keys.forEach((key) => {
        if (key !== null) {
            let jsonResult = JSON.parse(localStorage.getItem(key));
            arr.push(
                localStorage.getItem(key) ?
                jsonResult :
                null
            );
        }
    })
    return arr;
};

let parentsTask = () => {
    return dataTasks.filter(userTask => {
        return userTask.parentTask === null;
    });
}

let hasChildrenTask = (parentTaskId) => {
    return dataTasks.some(userTask => {
        return userTask.parentTask === parentTaskId;
    });
}

let getChildrenTask = (parentTaskId) => {
    return dataTasks.filter(userTask => {
        return userTask.parentTask === parentTaskId;
    });
}

let createButton = (textContent, buttonClass, selector, id) => {
    const button = createElement(buttonElevent);
    button.textContent = textContent;
    button.classList.add(buttonClass);
    button.id = selector + id;
    return button;
};

let generateListItem = (userTask) => {
    const li = createElement(liElement);
    li.id = liSelector + userTask.id;

    const span = createElement(spanElement);
    span.textContent = userTask.task;
    span.id = spanSelector + userTask.id;
    li.appendChild(span);

    let newButtonPlus = createButton(
        plus,
        buttonClassAdd,
        addButtonSelector,
        userTask.id);
    li.appendChild(newButtonPlus);

    const input = createElement(inputElement);
    input.placeholder = inputPlaceholder;
    input.classList.add(inputAreaClass);
    input.id = inputSelector + userTask.id;
    input.style.display = displayNone;
    li.appendChild(input);

    let newButtonMinus = createButton(
        minus,
        buttonClassDelete,
        deleteButtonSelector,
        userTask.id);
    li.appendChild(newButtonMinus);

    if (hasChildrenTask(userTask.id)) {
        let newButtonExpand = createButton(
            arrowDown,
            buttonClassShow,
            expandButtonSelector,
            userTask.id);
        li.appendChild(newButtonExpand);
    }

    return li;
}

let getWorkElement = (event) => {
    let eventTarget = event.target.id.split("_");
    let idToReturn = eventTarget[eventTarget.length - 1];
    return idToReturn;
}

let addEvent = (event) => {
    let itemNumber = getWorkElement(event);
    let input = getElementById(inputSelector + itemNumber);
    if (input.style.display === displayNone) {
        input.style.display = displayInlineBlock;
    } else {
        input.style.display = displayNone;
        let newTaskValue = input.value.trim();
        let parentElement = event.target.parentElement;
        if (newTaskValue) {
            let ulToAddLi = getElementById(ulSelector + itemNumber);
            childAddChild(ulToAddLi, newTaskValue, itemNumber, parentElement);
        }
        input.value = empty;
    }
}

let childAddChild = (ulToAddLi, newTaskValue, itemNumber, parentElement) => {
    let checkExpend = getElementById(expandButtonSelector + itemNumber);
    let ulWithNewTaskValue = ulAddNewChild(newTaskValue, itemNumber)
    let parentLi = getElementById(liSelector + itemNumber);
    if (ulToAddLi) {
        ulToAddLi.appendChild(ulWithNewTaskValue);
    } else {
        let ul = createElement(ulElement);
        ul.id = ulSelector + itemNumber;
        parentElement.appendChild(ul);
        ul.appendChild(ulWithNewTaskValue);
        ul.style.display = displayNone;
        if (hasChildrenTask(itemNumber) && checkExpend === null) {
            ul.style.display = displayBlock;
            let newButtonCollapse = createButton(
                arrowUp,
                buttonClassHide,
                expandButtonSelector,
                itemNumber);
            ul.before(newButtonCollapse);
        } else {
            parentLi.removeChild(ul);
        }
    }
}

let ulAddNewChild = (taskValue, parentId) => {

    let userTask = {
        id: uuidv4(),
        task: taskValue,
        parentTask: parentId
    }

    dataTasks.push(userTask);
    let jsonUserTask = JSON.stringify(userTask);
    localStorage.setItem(userTask.id.toString(), jsonUserTask);
    let newLi = generateListItem(userTask);
    return newLi;
}

let deleteEvent = (event) => {
    let idToRemove = getWorkElement(event);
    let parentTask = event.target.parentElement;
    let liToRemove = getElementById(liSelector + idToRemove);

    let parentUl = event.target.parentElement.parentElement;
    let parentId = parentUl.id.replace(ulSelector, empty);
    let parentLi = getElementById(liSelector + parentId);

    parentTask.remove(liToRemove);
    deleteAllChildTasks(idToRemove);
    childUlDeleteLiElement(parentUl, parentLi, parentId);
}

let deleteAllChildTasks = (toRemove) => {
    let arrToRemove = getChildrenTask(toRemove.toString());
    arrToRemove.forEach(element => deleteAllChildTasks(element.id))
    localStorage.removeItem(toRemove);
    dataTasks = [];
    dataTasks = parseLocalStorage();
}

let childUlDeleteLiElement = (parentUl, parentLi, id) => {
    if (parentUl.firstChild === null) {
        let expandButtonToDelete = getElementById(expandButtonSelector + id);
        if (expandButtonToDelete !== null) {
            parentLi.removeChild(expandButtonToDelete);
        }
        if (parentLi !== null) {
            parentLi.removeChild(parentUl);
        }
    }
}

let expandEvent = (event) => {
    let eventTargetId = event.target.parentElement.id.replace(liSelector, empty);
    let ulId = ulSelector + eventTargetId;
    let ulExpend = getElementById(ulId);
    if (ulExpend === null) {
        expendAction(event);
    } else {
        collapseAction(event);
    }
};

let expendAction = (expandEvent) => {
    let eventTarget = expandEvent.target,
        parentTask = eventTarget.parentElement,
        id = parentTask.id.replace(liSelector, empty),
        kidsTask = getChildrenTask(id),
        items = kidsTask.map(generateListItem),
        ul = createElement(ulElement);
    ul.id = ulSelector + id;
    items.forEach(li => {
        ul.appendChild(li);
    });
    parentTask.appendChild(ul);
    eventTarget = eventTargetAction(
        eventTarget,
        buttonClassShow,
        buttonClassHide,
        arrowUp
    );
}

let collapseAction = (expandEvent) => {
    let eventTarget = expandEvent.target,
        parentTask = eventTarget.parentElement,
        ul = parentTask.querySelector(ulElement);
    parentTask.removeChild(ul);
    eventTarget = eventTargetAction(
        eventTarget,
        buttonClassHide,
        buttonClassShow,
        arrowDown
    );
}

let eventTargetAction = (
    target,
    eventRemove,
    eventAdd,
    textContent
) => {
    target.classList.remove(eventRemove);
    target.classList.add(eventAdd);
    target.textContent = textContent;

    return target;
};

let createParentUl = () => {
    let parentUl = getElementById(parentUlId);
    if (parentUl === null) {
        let ul = createElement(ulElement);
        ul.id = parentUlId;
        root.appendChild(ul);
    }
}

let addNewParentTask = (event) => {
    let parentUl = getElementById(parentUlId);
    let newTaskValue = topInput.value.trim()
    if (newTaskValue) {
        let ulWithChild = ulAddNewChild(newTaskValue, null);
        parentUl.appendChild(ulWithChild);
    }

    topInput.value = empty;
};

let addParents = () => {
    let parentsArray = parentsTask();
    let parentUl = getElementById(parentUlId);
    if (parentsArray.length) {
        const items = parentsArray.map(generateListItem);
        items.forEach(li => {
            parentUl.appendChild(li);
        });
        root.appendChild(parentUl);
    }
}

dataTasks = parseLocalStorage();
createParentUl();
addParents();

document.addEventListener(eventClick, (event) => {
    event.preventDefault();
    event.stopPropagation();
    switch (event.target.className) {
        case buttonClassAdd:
            addEvent(event);
            break;
        case buttonClassDelete:
            deleteEvent(event);
            break;
        case buttonClassShow:
            expandEvent(event)
            break;
        case buttonClassHide:
            expandEvent(event)
            break;
        case inputAreaButtonClass:
            addNewParentTask(event);
            break;

    }
})