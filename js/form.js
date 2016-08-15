$(function() {
    var mainForm;
    var formElems = [];
    var initData;
    
    loadForm();
    
    if (typeof(formUpdateName) != 'undefined') {
        var interval = typeof(formUpdateInterval) == 'number' ? formUpdateInterval : 5;
        setInterval(onUpdate, interval * 1000);
    }
    
    function loadForm() {
        var json = loadJson(formConfigName);
        mainForm = $('#main-form');
        createMenu(json)
        applyAttributes(json);
        json.rows.forEach(applyRow);
        onReload();
    }

    function loadJson(url, callback) {
        var opts = {dataType: 'json'};
        if (typeof(callback) == 'function') {
            opts.success = callback;
            opts.async = true;
        } else {
            opts.async = false;
        }
        var res = $.ajax(url, opts);
        return opts.async ? true : JSON.parse(res.responseText);
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
            case 'table':
                applyTable(span, elem);
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
        if (elem.readonly) {
            input.attr('disabled', 'true');
        }
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
        fillSelect(input, elem.value);
        span.append(input);
        formElems[elem.id] = {"type": "select"};
    }
    
    function applySubmit(span, elem) {
        var input;
        if (typeof(elem.target) == 'undefined') {
            input = $('<input type="submit"/>');
        } else {
            input = $('<input type="button"/>');
            input.click(function() {
                sendValues(elem.target, elem.fields);
            });
        }
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
            setupValues(initData, false);
        });
    }
    
    function applyTable(span, elem) {
        var table = $('<table><thead></thead><tbody></tbody></table>');
        table.addClass('table').addClass('table-striped')
                .addClass('table-bordered').addClass('table-hover');
        table.attr('name', elem.id);
        span.append(table);
        formElems[elem.id] = {"type": "table"};
    }
    
    function tableRowClicked() {
        $(this).addClass('active').siblings().removeClass('active');
    }
    
    function createMenu(json) {
        if (typeof(json.menu) === 'undefined') {
            return;
        }
        var menu = json.menu;
        var asTabs = typeof(menu.tabs) === 'boolean' && menu.tabs;
        var selected = typeof(menu.selected) === 'number' ? menu.selected : 0;
        var ul = $('<ul class="nav"></ul>').addClass(asTabs ? 'nav-tabs' : 'nav-pills');
        var items = assignOrLoad(menu.items);
        for (var i in items) {
            var item = items[i];
            var a = $('<a></a>').text(item[0]).attr('href', item[1]);
            var li = $('<li></li>').append(a);
            if (selected == i) {
                li.addClass('active');
            }
            ul.append(li);
        }
        mainForm.before($('<div></div>').append(ul));
    }
    
    function assignOrLoad(jsonOrUrl) {
        if (typeof(jsonOrUrl) !== 'string') {
            return jsonOrUrl;
        }
        return loadJson(jsonOrUrl);
    }

    function setupValues(data, disabledOnly) {
        for (id in data) {
            if (typeof(formElems[id]) != 'object') {
                alert('No form element found for id: ' + id);
            }
            var elem = $('[name=' + id +']');
            if (disabledOnly && !elem.is('[disabled]')) {
                continue;
            }
            switch (formElems[id].type) {
                case 'text':
                    elem.val(data[id]);
                    break;
                case 'select':
                    if (typeof(data[id]) !== 'object') {
                        elem.val(data[id]);
                    } else {
                        fillSelect(elem, data[id]);
                    }
                    break;
                case 'check':
                    elem.prop('checked', data[id]);
                    break;
                case 'table':
                    fillTable(elem, data[id]);
                    break;
            }
        }
    }
    
    function fillTable(elem, data) {
        var head = elem.find('thead').empty();
        var tr = $('<tr></tr>').appendTo(head);
        for (var i in data.head) {
            $('<th></th>').text(data.head[i]).appendTo(tr);
        }
        var body = elem.find('tbody').empty();
        for (var j in data.body) {
            var row = data.body[j];
            var tr = $('<tr></tr>').appendTo(body);
            for (var i in row) {
                $('<td></td>').text(row[i]).appendTo(tr);
            }
            tr.click(tableRowClicked);
        }
    }
    
    function fillSelect(elem, data) {
        elem.empty();
        var selected = null;
        data.forEach(function(option) {
            var o = $('<option/>').text(option[0]).attr('value', option[1]).appendTo(elem);
            if (option.length > 2 && option[2]) {
                selected = option[1];
            }
        });
        if (selected) {
            elem.val(selected);
        }
    }
    
    function collectValues(fields) {
        if (typeof(fields) == 'undefined') {
            fields = Object.keys(formElems);
        }
        var data = {};
        for (var i in fields) {
            var id = fields[i];
            var elem = $('[name=' + id +']');
            switch (formElems[id].type) {
                case 'text':
                case 'select':
                    data[id] = elem.val();
                    break;
                case 'check':
                    data[id] = !!elem.prop('checked');
                    break;
                case 'table':
                    data[id] = collectFromTable(elem);
            }
        }
        console.log(data);
        return data;
    }
    
    function collectFromTable(table) {
        var res = [];
        table.find('tr.active').each(function(j, tr) {
            var row = [];
            $(tr).find('td').each(function(i, td) {
                row.push($(td).text());
            });
            res.push(row);
        });
        return res;
    }
    
    function sendValues(url, fields) {
        var json = collectValues(fields);
        $.ajax({
            url: url,
            type: 'post',
            data: JSON.stringify(json),
            dataType: 'text',
            success: function(data) {
                alert(data);
                setTimeout(function() {onReload();}, 50);
            },
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
    
    function onUpdate() {
        var data = loadJson(formUpdateName, function(data) {
            setupValues(data, true);
        });
    }
    
    function onReload() {
        initData = loadJson(formInitName);
        setupValues(initData, false);
    }
    
});


