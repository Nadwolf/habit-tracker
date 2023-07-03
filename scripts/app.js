'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
const page = {
  body: document.querySelector('body'),
  menu: document.querySelector('.menu'),
  addButton: document.querySelector('.add-button'),
  habit: document.querySelector('.habit'),
  habbitContent: document.querySelector('.habbit-content'),
  habbitHeader: {
    habbitTitle: document.querySelector('.habit-title'),
    progresPercent: document.querySelector('.progres-percent'),
    progresBar: document.querySelector('.progres-bar'),
  },
  content: {
    habitList: document.querySelector('.habit-list'),
    newCommentDay: document.querySelector('.new-comment .comment-day'),
    form: document.querySelector('form.comment-description'),
  },
  popup: {
    window: document.querySelector('.popup'),
    form: document.querySelector('.popup-form'),
  },
};

// storage
function loadData() {
  try {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitsCollection = JSON.parse(habbitsString);
    if (habbitsCollection) {
      habbits = habbitsCollection;
    }
  } catch (error) {
    console.error('Не валидные данные', error);
  }
}

function saveData() {
  const habbitsString = JSON.stringify(habbits);
  localStorage.setItem(HABBIT_KEY, habbitsString);
}

// utiles

function clearPopupForm() {
  const form = page.popup.form;
  form.reset();
  form.elements.habbit.forEach((item) => {
    item.nextElementSibling.classList.remove('error');
  });
  form.habbitName.classList.remove('error');
  form.habbitGoal.classList.remove('error');
}

function getDataForm(form, fields) {
  const dataForm = new FormData(form);
  const res = {};
  let formIsValid = true;
  fields.forEach((field) => {
    let data = dataForm.get(field.name);
    if (field.type === 'number') {
      data = Number(data);
    }
    const isNodeList = NodeList.prototype.isPrototypeOf(form[field.name]);
    if (isNodeList) {
      form[field.name].forEach((item) =>
        item.nextElementSibling.classList.remove('error')
      );
    } else {
      form[field.name].classList.remove('error');
    }
    if (!data) {
      if (isNodeList) {
        form[field.name].forEach((item) =>
          item.nextElementSibling.classList.add('error')
        );
      } else {
        form[field.name].classList.add('error');
      }
      formIsValid = false;
    }
    res[field.name] = data;
  });
  if (!formIsValid) {
    return;
  }
  return res;
}

// renders
function renderMenu(activeHabbit) {
  habbits.forEach((habbit) => {
    const existHabbit = page.menu.querySelector(`[habbit-id="${habbit.id}"]`);
    if (!existHabbit) {
      const elem = document.createElement('a');
      elem.classList.add('menu-link');
      elem.setAttribute('habbit-id', habbit.id);
      elem.innerHTML = `<svg class="menu-icon">
        <use xlink:href="img/sprite.svg#${habbit.icon}"></use>
      </svg>`;
      if (habbit.id === activeHabbit.id) {
        elem.classList.add('menu-link-active');
      }
      elem.addEventListener('click', () => {
        render(habbit);
      });
      page.menu.appendChild(elem);
    } else {
      existHabbit.classList.remove('menu-link-active');
      if (habbit.id === activeHabbit.id) {
        existHabbit.classList.add('menu-link-active');
      }
    }
  });
}

function renderHabbitHeader(habbit) {
  const progresPercent =
    habbit.days.length <= habbit.target
      ? (habbit.days.length * 100) / habbit.target
      : 100;
  page.habbitHeader.habbitTitle.textContent = habbit.name;
  page.habbitHeader.progresPercent.textContent = progresPercent.toFixed() + '%';
  page.habbitHeader.progresBar.style.setProperty(
    '--progress',
    `${progresPercent}%`
  );
}

function renderHabbitComments(habbit) {
  page.content.habitList.innerHTML = '';
  habbit.days.forEach((day, i) => {
    const elem = document.createElement('li');
    elem.classList.add('comment');
    elem.innerHTML = `<h3 class="comment-day">День ${i + 1}</h3>
            <div class="comment-description">
              <span class="comment-text"
                >${day.comment}</span
              >
              <button class="delete" onclick="deleteDay(${i})">
                <svg class="delete-button-icon">
                  <use xlink:href="img/sprite.svg#delete"></use>
                </svg>
              </button>
            </div>`;
    page.content.habitList.appendChild(elem);
  });
  page.content.newCommentDay.textContent = `День ${habbit.days.length + 1}`;
  page.content.form.setAttribute('active-habbit-id', habbit.id);
}

function renderGreeting() {
  const elem = document.createElement('div');
  elem.classList.add('greeting');
  elem.innerHTML = `
  <h2 class="greeting-title">Пока пусто!
    <span class="greeting-subtitle">Создай свою первую привычку.</span>
  </h2>
  <button class="button" onclick="toglePopup()">Создать</button>
  `;
  page.habbitContent.style.display = 'none';
  page.habit.appendChild(elem);
}

function renderHabbitContent() {
  const greeting = page.habit.querySelector('.greeting');
  if (greeting) {
    greeting.remove();
    page.habbitContent.style.display = 'block';
  }
}

function render(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  document.location.replace(`${document.location.pathname}#${activeHabbit.id}`);
  document.title = `Habbit - трекер привычек | ${activeHabbit.name}`;
  renderHabbitContent();
  renderMenu(activeHabbit);
  renderHabbitHeader(activeHabbit);
  renderHabbitComments(activeHabbit);
}

// work with days
function addDays(e) {
  e.preventDefault();
  const form = e.target;
  const { newDayComment } = getDataForm(form, [
    { name: 'newDayComment', type: 'text' },
  ]);
  form.newDayComment.value = '';
  const habbitId = Number(form.getAttribute('active-habbit-id'));
  const habbit = habbits.find((habbit) => habbit.id === habbitId);
  habbit.days.push({ comment: newDayComment });
  saveData();
  render(habbit);
}

function deleteDay(index) {
  const habbitId = Number(page.content.form.getAttribute('active-habbit-id'));
  const habbit = habbits.find((habbit) => habbit.id === habbitId);
  habbit.days.splice(index, 1);
  saveData();
  render(habbit);
}

// work with popup
function toglePopup() {
  page.body.classList.toggle('shadow');
  page.popup.window.classList.toggle('popup-open');
  clearPopupForm();
}

//work with new habbit
function addHabbit(e) {
  e.preventDefault();
  const form = e.target;
  const data = getDataForm(form, [
    {
      name: 'habbit',
      type: 'text',
    },
    {
      name: 'habbitName',
      type: 'text',
    },
    {
      name: 'habbitGoal',
      type: 'number',
    },
  ]);
  if (data) {
    habbits.push({
      id: habbits.length + 1,
      icon: data.habbit,
      name: data.habbitName,
      target: data.habbitGoal,
      days: [],
    });
    toglePopup();
    saveData();
    render(habbits[habbits.length - 1]);
  }
}

(() => {
  loadData();
  if (!habbits.length) {
    renderGreeting();
  }
  const id = document.location.hash.replace('#', '');
  const habbit = habbits.find((habbit) => habbit.id === Number(id));
  if (habbit) {
    render(habbit);
  } else if (habbits.length) {
    render(habbits[0]);
  }
})();
