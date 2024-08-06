 // Initialize task list and nextId from localStorage
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
    let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Save tasks and nextId to localStorage
function saveData() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }

// Todo: create a function to create a task card
function createTaskCard(task) {
    const now = dayjs().format("YYYY-MM-DD");
    const deadline = dayjs(task.deadline);
    const today = dayjs(now);

    const cardClass = deadline.isBefore(today) ? 'red' : (deadline.diff(today, 'day') <= 2 ? 'yellow' : '');

    return $(`
      <div class="card ${cardClass}" id="${task.id}">
        <div class="card-header">
          ${task.title} <span class="delete-btn">&times;</span>
        </div>
        <div class="card-body">
          <p>${task.description}</p>
          <p>Deadline: ${task.deadline}</p>
        </div>
      </div>
    `);
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();

    taskList.forEach((task) => {
      const taskCard = createTaskCard(task);
      $(`#${task.state}-cards`).append(taskCard);
    });

    $(".card").draggable({
      revert: "invalid",
      helper: "clone",
      start: function () { $(this).hide(); },
      stop: function () { $(this).show(); },
    });

    $(".lane .card-body").droppable({
      accept: ".card",
      drop: function (event, ui) {
        const card = ui.helper.clone().remove();
        $(this).append(card);
        const id = card.attr("id");
        const newState = $(this).closest(".lane").attr("id");
        const task = taskList.find(task => task.id === id);
        if (task) {
          task.state = newState;
          saveData();
          renderTaskList();
        }
      }
    });
  }

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const title = $("#title").val();
    const description = $("#description").val();
    const deadline = $("#deadline").val();

    const newTask = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      state: "to-do",
    };

    taskList.push(newTask);
    saveData();
    renderTaskList();

    $("#task-form")[0].reset();
    $("#formModal").modal("hide");

}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const id = $(this).closest(".card").attr("id");
    taskList = taskList.filter(task => task.id !== id);
    saveData();
    renderTaskList();

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const card = ui.helper.clone();
    $(this).append(card);
    ui.helper.remove();

    const id = card.attr("id");
    const newState = $(this).closest(".lane").attr("id");

    const task = taskList.find(task => task.id === id);
    if (task) {
      task.state = newState;
      saveData();
    }

    renderTaskList();
}
renderTaskList();

// Add event listener to the form
$("#task-form").submit(handleAddTask);

// Initialize date picker for the deadline field
$("#deadline").datepicker({
  dateFormat: "yy-mm-dd"
});