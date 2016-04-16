$(function() {
    loadForm();
});

function loadForm() {
    var json = loadJson('./form.json');
    window.mainForm = $('#main-form');
    applyAttributes(json);
    json.rows.forEach(applyRow);
}

function loadJson(url) {
    var res = $.ajax(url, {
        async: false,
        dataType: 'json'
    });
    return JSON.parse(res.responseText);
}

function applyAttributes(json) {
    var h1 = $('<h1>').addClass('text-center').text(json.title);
    $('<div class="row"></div>').append(h1).appendTo(mainForm);
    mainForm.attr('action', json.target);
}

function applyRow(rowData) {
    var row = $('<div class="row form-row"></div>');
    rowData.forEach(function(element) {
        row.append(applyElement(element));
    });
    row.appendTo(mainForm);
}

function applyElement(elem) {
    var span = $('<span></span>').addClass('col-md-' + elem.size);
    switch (elem.type) {
        case 'label':
            applyLabel(span, elem);
            break;
        case 'text':
            applyText(span, elem);
            break;
        case 'check':
            applyCheckbox(span, elem);
            break;
        case 'select':
            applySelect(span, elem);
            break;
        case 'submit':
            applySubmit(span, elem);
            break;
        default:
            span.html('&nbsp;');
    }
    return span;
}

function applyLabel(span, elem) {
    span.text(elem.value);
}

function applyText(span, elem) {
    var input = $('<input type="text"/>');
    input.addClass('form-control');
    input.attr('value', elem.value).attr('name', elem.id);
    span.append(input);
}

function applyCheckbox(span, elem) {
    var input = $('<input type="checkbox"/>');
    input.addClass('form-control');
    input.attr('name', elem.id);
    if (elem.value) {
        input.attr('checked', 'true');
    }
    span.append(input);
}

function applySubmit(span, elem) {
    var input = $('<input type="submit"/>');
    input.addClass('btn').addClass('btn-default').addClass('form-control');
    input.attr('value', elem.value);
    span.append(input);
}

function applySelect(span, elem) {
    var input = $('<select><select/>');
    input.addClass('form-control');
    input.attr('name', elem.id);
    elem.value.forEach(function(option) {
        $('<option/>').text(option[0]).attr('value', option[1]).appendTo(input);
    });
    span.append(input);
}

