$(function() {
    var mainForm;
    var formElems = [];
    var initData;
    
    loadForm();

    function loadForm() {
        var json = loadJson(formConfigName);
        mainForm = $('#main-form');
        applyAttributes(json);
        json.rows.forEach(applyRow);
        initData = loadJson(formInitName);
        setupValues(initData);
    }

    function loadJson(url) {
        var res = $.ajax(url, {
            async: false,
            dataType: 'json'
        });
        return JSON.parse(res.responseText);
    }

    function applyAttributes(json) {
        document.title = json.title;
        var h1 = $('<h1>').addClass('text-center').text(json.title);
        $('<div class="row"></div>').append(h1).appendTo(mainForm);
        mainForm.attr('action', json.target);
        mainForm.attr('method', json.method);
        mainForm.submit(onSubmit);
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
            case 'reset':
                applyReset(span, elem);
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
        formElems[elem.id] = {"type": "text"};
    }

    function applyCheckbox(span, elem) {
        var input = $('<input type="checkbox"/>');
        input.addClass('form-control');
        input.attr('name', elem.id);
        if (elem.value) {
            input.attr('checked', 'true');
        }
        span.append(input);
        formElems[elem.id] = {"type": "check"};
    }

    function applySelect(span, elem) {
        var input = $('<select><select/>');
        input.addClass('form-control');
        input.attr('name', elem.id);
        elem.value.forEach(function(option) {
            $('<option/>').text(option[0]).attr('value', option[1]).appendTo(input);
        });
        span.append(input);
        formElems[elem.id] = {"type": "select"};
    }
    
    function applySubmit(span, elem) {
        var input = $('<input type="submit"/>');
        input.addClass('btn').addClass('btn-default').addClass('form-control');
        input.attr('value', elem.value);
        span.append(input);
    }

    function applyReset(span, elem) {
        var input = $('<input type="button"/>');
        input.addClass('btn').addClass('btn-default').addClass('form-control');
        input.attr('value', elem.value);
        span.append(input);
        input.click(function() {
            setupValues(initData);
        });
    }

    function setupValues(data) {
        for (id in data) {
            if (typeof(formElems[id]) != 'object') {
                alert('No form element found for id: ' + id);
            }
            var elem = $('[name=' + id +']');
            switch (formElems[id].type) {
                case 'text':
                case 'select':
                    elem.val(data[id]);
                    break;
                case 'check':
                    elem.prop('checked', data[id]);
                    break;
            }
        }
    }
    
    function collectValues() {
        var data = {};
        for (id in formElems) {
            var elem = $('[name=' + id +']');
            switch (formElems[id].type) {
                case 'text':
                case 'select':
                    data[id] = elem.val();
                    break;
                case 'check':
                    data[id] = !!elem.prop('checked');
            }
        }
        return data;
    }
    
    function sendValues(url) {
        var json = collectValues();
        $.ajax({
            url: url,
            type: 'post',
            data: JSON.stringify(json),
            dataType: 'text',
            success: function() {alert('Данные сохранены');},
            error: function(req, status) {
                alert('Ошибка при сохранении данных:\n' + status);}
        });
    }
    
    function onSubmit() {
        if (mainForm.attr('method') != 'json') {
            return true;
        }
        sendValues(mainForm.attr('action'));
        return false;
    }
});


