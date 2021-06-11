'use strict';

window.onload = function() {
    function openModal(element) {
        var event = new CustomEvent('openModal');
        element.dispatchEvent(event);
    }

    function get_date(date) {
        let year = date.slice(0, 4),
            month = date.slice(5, 7),
            day = date.slice(8, 10),
            hour = date.slice(11, 13),
            minute = date.slice(14, 16);
        return day + '.' + month + '.' + year + ' ' + hour + ':' + minute;
    }

    function get_notes(data, type) {
        let s = '';
        for (let i of data) {
            s += `<div class="`;

            if (sorting == 'list') s += 'col-12 col-for-card mt-3">';
            else s +=`col-xl-3 col-lg-4 col-md-6 col-sm-12 mt-3 col-for-card">`;

            s +=     `<div class="card" id="` + type + `_` + i.pk + `">
                      <input type="hidden" value="` + i.pk + `">
                      <div class="card-body">
                        <h5 class="card-title">` + i.title + `</h5>
                        <h6 class="card-subtitle mb-2 text-muted">`;

            for (let j of i.labels) {
                for (let k of label_list.children) {
                    if (k.children[0].id == 'label_' + j) {
                        s += `<span data-href="` + domain + `/labels/` + j + `/" class="list_title">` + k.children[0].innerHTML + `</a> `;
                    }
                }
            }

            s +=       `</h6>
                        <pre class="card-text">`;

            if (i.content != null) {
                if (i.content.length > 250) s += i.content.slice(0, 250) + '...';
                else s += i.content;
            }

            s +=       `</pre>
                      </div>
                      <div class="card-footer text-muted">`;

            if (lang == 'ru')
                s += `Изменено в `;
            else if (lang == 'en')
                s += 'Edited at ';

                s += get_date(i.last_edited_at) + `</div>
                   </div>
                  </div>`;
        }
        return s;
    }

    function add_dnone(array) {
        for (let i of array) {
            i.classList.add('d-none');
        }
    }

    function remove_dnone(array) {
        for (let i of array) {
            i.classList.remove('d-none');
        }
    }

    function get_text_for_label(i, type) {
        return `<div>
                  <input class="checkbox" type="checkbox" id="` + type + `_` + i.pk + `">
                  <label for="` + type + `_` + i.pk + `">` + i.title + `</label>
                </div>`;
    }

    function add_message(type, text) {
        let level = '';

        if (type == 'Success' || type == 'Успех') level = 'success';
        else level = 'error';

        return `<div class="alert alert--` + level + ` alert--is-visible js-alert w-100 mb-2" role="alert">
                  <div class="flex items-center">
                    <svg aria-hidden="true" class="icon margin-right-xxxs" viewBox="0 0 32 32"><g><path d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M23.7,11.7l-10,10C13.5,21.9,13.3,22,13,22 s-0.5-0.1-0.7-0.3l-4-4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l3.3,3.3l9.3-9.3c0.4-0.4,1-0.4,1.4,0S24.1,11.3,23.7,11.7z"></path></g></svg>
                    <p><strong>` + type + `:</strong> ` + text + `.</p>
                  </div>
                </div>`;
    }

    function send_data(loader, method, url, data) {
        loader.open(method, url, true);
        if (data != false) loader.setRequestHeader('Content-Type', 'application/json');
        loader.setRequestHeader('Authorization', 'Basic ' + credentials);
        if (data == false) loader.send();
        else loader.send(data);
    }

    let domain = 'http://127.0.0.1:8000',
        username, password, credentials,
        lang = document.querySelector('html').lang,
        theme = 'light', sorting = 'grid';

    for (let i of document.cookie.split('; ')) {
        let j = i.split('=');
        if (j[0] == 'username') username = j[1];
        else if (j[0] == 'password') password = j[1];
    }

    credentials = window.btoa(username + ':' + password);


    // Profile settings
    let profileLoader = new XMLHttpRequest();

    profileLoader.onreadystatechange = function() {
        if (profileLoader.readyState == 4 && profileLoader.status == 200) {
            let data = JSON.parse(profileLoader.responseText);

            profile_form_username.value = data.username;
            profile_form_email.value = data.email;

            if (data.sort == 'b') {
                list.classList.remove('d-md-flex');
                grid.classList.add('d-md-flex');

                sorting = 'list';
            } else sorting = 'grid';

            if (data.theme == 'a') {
                light_theme_switch.setAttribute('checked', '');
            } else if (data.theme == 'b') {
                dark_theme_switch.setAttribute('checked', '');
                document.head.innerHTML += '<meta name="theme-color" content="#1c1c21">'
                theme = 'dark';

                crutch_link.href = '/static/css/crutch-dark.css';

                refresh_button.children[0].remove();
                refresh_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                    width="24" height="24" viewBox="0 0 171 171" style=" fill:#000000;"><g fill="none"
                    fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt"
                    stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0"
                    font-family="none" font-weight="none" font-size="none" text-anchor="none"
                    style="mix-blend-mode: normal"><path d="M0,171.99654v-171.99654h171.99654v171.99654z"
                    fill="none"></path><g fill="#cccccc"><path d="M85.5,21.375c-19.49725,
                    0 -36.942,8.77565 -48.69214,22.55786l-15.43286,-15.43286v42.75h42.75l-17.15845,
                    -17.15845c9.14134,-11.22188 22.96463,-18.46655 38.53345,-18.46655c27.49537,0 49.875,
                    22.3725 49.875,49.875h14.25c0,-35.35425 -28.76362,-64.125 -64.125,
                    -64.125zM21.375,85.5c0,35.36138 28.76362,64.125 64.125,64.125c19.49725,
                    0 36.94201,-8.77565 48.69214,-22.55786l15.43286,15.43286v-42.75h-42.75l17.15845,
                    17.15845c-9.14134,11.22188 -22.96463,18.46655 -38.53345,18.46655c-27.49538,0 -49.875,
                    -22.37963 -49.875,-49.875z"></path></g></g></svg>` + refresh_button.innerHTML;

                create.children[0].remove();
                create.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                    width="24" height="24" viewBox="0 0 171 171" style=" fill:#000000;"><g fill="none"
                    fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"
                    stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none"
                    font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
                    <path d="M0,171.99654v-171.99654h171.99654v171.99654z" fill="none"></path><g fill="#cccccc">
                    <path d="M78.375,21.375v57h-57v14.25h57v57h14.25v-57h57v-14.25h-57v-57z"></path></g></g></svg>` + create.innerHTML;

                list.children[0].remove();
                list.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24"
                    viewBox="0 0 171 171" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none"
                    stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray=""
                    stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"
                    style="mix-blend-mode: normal"><path d="M0,171.99654v-171.99654h171.99654v171.99654z" fill="none">
                    </path><g fill="#cccccc"><path d="M21.375,32.0625c-5.90254,0 -10.6875,4.78496 -10.6875,10.6875c0,
                    5.90254 4.78496,10.6875 10.6875,10.6875c5.90254,0 10.6875,-4.78496 10.6875,-10.6875c0,-5.90254 -4.78496,
                    -10.6875 -10.6875,-10.6875zM49.875,35.625v14.25h106.875v-14.25zM21.375,74.8125c-5.90254,
                    0 -10.6875,4.78496 -10.6875,10.6875c0,5.90254 4.78496,10.6875 10.6875,10.6875c5.90254,0 10.6875,
                    -4.78496 10.6875,-10.6875c0,-5.90254 -4.78496,-10.6875 -10.6875,-10.6875zM49.875,
                    78.375v14.25h106.875v-14.25zM21.375,117.5625c-5.90254,0 -10.6875,4.78496 -10.6875,10.6875c0,
                    5.90254 4.78496,10.6875 10.6875,10.6875c5.90254,0 10.6875,-4.78496 10.6875,-10.6875c0,-5.90254 -4.78496,
                    -10.6875 -10.6875,-10.6875zM49.875,121.125v14.25h106.875v-14.25z"></path></g></g></svg>` + list.innerHTML;

                grid.children[0].remove();
                grid.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 171 171"
                    style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1"
                    stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray=""
                    stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"
                    style="mix-blend-mode: normal"><path d="M0,171.99654v-171.99654h171.99654v171.99654z" fill="none">
                    </path><g fill="#cccccc"><path d="M35.625,21.375c-7.78807,0 -14.25,6.46193 -14.25,14.25v28.5c0,
                    7.78807 6.46193,14.25 14.25,14.25h28.5c7.78807,0 14.25,-6.46193 14.25,-14.25v-28.5c0,-7.78807 -6.46193,
                    -14.25 -14.25,-14.25zM106.875,21.375c-7.78807,0 -14.25,6.46193 -14.25,14.25v28.5c0,7.78807 6.46193,
                    14.25 14.25,14.25h28.5c7.78807,0 14.25,-6.46193 14.25,-14.25v-28.5c0,-7.78807 -6.46193,-14.25 -14.25,
                    -14.25zM35.625,35.625h28.5v28.5h-28.5zM106.875,35.625h28.5v28.5h-28.5zM35.625,92.625c-7.78807,
                    0 -14.25,6.46193 -14.25,14.25v28.5c0,7.78807 6.46193,14.25 14.25,14.25h28.5c7.78807,0 14.25,
                    -6.46193 14.25,-14.25v-28.5c0,-7.78807 -6.46193,-14.25 -14.25,-14.25zM106.875,92.625c-7.78807,
                    0 -14.25,6.46193 -14.25,14.25v28.5c0,7.78807 6.46193,14.25 14.25,14.25h28.5c7.78807,0 14.25,
                    -6.46193 14.25,-14.25v-28.5c0,-7.78807 -6.46193,-14.25 -14.25,-14.25zM35.625,106.875h28.5v28.5h-28.5zM106.875,
                    106.875h28.5v28.5h-28.5z"></path></g></g></svg>` + grid.innerHTML;

                recovery_button.children[0].remove();
                recovery_button.innerHTML = `<svg id="recovery_button_svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                    width="24" height="24" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero"
                    stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10"
                    stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none"
                    text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path>
                    <g fill="#CCCCCC"><path d="M43,14.33333c-7.90483,0 -14.33333,6.4285 -14.33333,14.33333v114.66667c0,7.90483 6.4285,
                    14.33333 14.33333,14.33333h36.39323c-2.57283,-4.43617 -4.53941,-9.245 -5.85091,
                    -14.33333h-30.54232v-114.66667h50.16667v35.83333h35.83333v7.16667c4.95933,0 9.74667,0.69315 14.33333,
                    1.87565v-16.20899l-43,-43zM129,86c-23.66165,0 -43,19.33835 -43,43c0,10.01227 3.48973,19.23833 9.26628,
                    26.56706l-9.26628,9.26628h28.66667v-28.66667l-9.19629,9.19629c-0.11657,-0.16714 -0.25088,-0.32018 -0.36393,
                    -0.48991c-3.01813,-4.53135 -4.77311,-9.97796 -4.77311,-15.87305c0,-1.98909 0.19407,-3.92328 0.57389,
                    -5.79492c2.65875,-13.10145 14.16917,-22.87174 28.09277,-22.87174c15.91269,0 28.66667,12.75398 28.66667,
                    28.66667c0,15.91269 -12.75398,28.66667 -28.66667,28.66667v14.33333c23.66165,0 43,-19.33835 43,
                    -43c0,-23.66165 -19.33835,-43 -43,-43z"></path></g></g></svg>` + recovery_button.innerHTML;

                delete_button.children[0].remove();
                delete_button.innerHTML = `<svg id="delete_button_svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                    width="24" height="24" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero"
                    stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10"
                    stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none"
                    text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path>
                    <g fill="#CCCCCC"><path d="M71.66667,14.33333l-7.16667,7.16667h-28.66667h-7.16667v14.33333h7.16667v107.5c0,
                    7.83362 6.49972,14.33333 14.33333,14.33333h71.66667c7.83362,0 14.33333,-6.49972 14.33333,
                    -14.33333v-107.5h7.16667v-14.33333h-7.16667h-7.16667h-21.5l-7.16667,-7.16667zM50.16667,
                    35.83333h71.66667v107.5h-71.66667z"></path></g></g></svg>` + delete_button.innerHTML;
            }

            if (data.language == 'a') {
                russian_language_switch.setAttribute('checked', '');
                if (data.avatar) avatar_upload_btn.innerHTML = 'Изменить фото';
            }
            else if (data.language == 'b') {
                english_language_switch.setAttribute('checked', '');
                if (data.avatar) avatar_upload_btn.innerHTML = 'Edit photo';
            }

            let m, d;

            if (data.avatar == null) {
                m = `
                <div style="height: 38px;" class="avatar avatar--lg">
                  <figure style="width: 38px; height: 38px" class="avatar__figure" role="img">
                    <svg style="width: 38px; height: 38px" class="avatar__placeholder" aria-hidden="true" viewBox="0 0 20 20" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="6" r="2.5" stroke="currentColor"/><path d="M10,10.5a4.487,4.487,0,0,0-4.471,4.21L5.5,15.5h9l-.029-.79A4.487,4.487,0,0,0,10,10.5Z" stroke="currentColor"/></svg>
                  </figure>
                </div>`;
                d = `
                <div style="height: 45px;" class="avatar avatar--lg">
                  <figure style="width: 45px; height: 45px; padding: 0;" class="avatar__figure" role="img">
                    <svg style="width: 45px; height: 45px" class="avatar__placeholder" aria-hidden="true" viewBox="0 0 20 20" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="6" r="2.5" stroke="currentColor"/><path d="M10,10.5a4.487,4.487,0,0,0-4.471,4.21L5.5,15.5h9l-.029-.79A4.487,4.487,0,0,0,10,10.5Z" stroke="currentColor"/></svg>
                  </figure>
                </div>
                `
            } else {
                m = `<img class="header_avatar_mobile" src="` + domain + data.avatar + `">`;
                d = `<img class="header_avatar" src="` + domain + data.avatar + `">`;

                if (lang == 'ru')
                    delete_avatar_button_wrapper.innerHTML = '<button type="button" class="btn btn--accent" id="delete_avatar_button">Удалить фото</button>';
                else
                    delete_avatar_button_wrapper.innerHTML = '<button type="button" class="btn btn--accent" id="delete_avatar_button">Delete photo</button>';

                delete_avatar_button.addEventListener('click', function() {
                    openModal(delete_avatar_modal);
                });
            }

            profile_mobile.innerHTML = m + '<div id="header_username_mobile">' + username + '</div>';
            profile_desktop.innerHTML = d + '<div id="header_username">' + username + '</div>';

            header_username.innerHTML = username;
            header_username_mobile.innerHTML = username;
        }
    }


    // labelListLoader
    let labelsLoader = new XMLHttpRequest();

    labelsLoader.onreadystatechange = function() {
        if (labelsLoader.readyState == 4 && labelsLoader.status == 200) {
            let data = JSON.parse(labelsLoader.responseText),
                s = '',
                n = '',
                e = '',
                r = '',
                t = '';

            if (data.length > 0) {
                header_labels.classList.remove('d-none');
                for (let i of data) {
                    s += '<li><a href="' + domain + '/label/' + i.pk + '/" class="f-header__dropdown-link" id="label_' + i.pk + '">' + i.title + '</a></li>';
                    n += get_text_for_label(i, 'new');
                    e += get_text_for_label(i, 'edit');
                    r += get_text_for_label(i, 'recovery');

                    let t_text = '';
                    if (lang == 'ru')
                        t_text = 'Удалить';
                    else
                        t_text = 'Delete';

                    t += `
                    <div class="d-flex justify-content-between w-100">
                      <a href="` + domain + `/labels/` + i.pk + `/" class="edit_label_button">` + i.title + `</a>
                      <a href="` + domain + `/labels/` + i.pk + `/" class="delete_label_button">` + t_text + `</a>
                    </div>`;
                }
                new_note_form_labels.innerHTML = n;
                edit_note_form_labels.innerHTML = e;
                recovery_note_form_labels.innerHTML = r;
                label_list.innerHTML = s;
            } else header_labels.classList.add('d-none');

            if (lang == 'ru')
                t += `<div align="right" class="w-100"><a href="#" id="new_label_button" aria-controls="new_label_modal">Добавить</a></div>`;
            else
                t += `<div align="right" class="w-100"><a href="#" id="new_label_button" aria-controls="new_label_modal">Add</a></div>`;
            label_table.innerHTML = t;

            // Show new label form
            new_label_button.addEventListener('click', function(event) {
                event.preventDefault();
                openModal(new_label_modal);
            });
        }
    }


    // labelDetailLoader
    let labelDetailLoader = new XMLHttpRequest();

    labelDetailLoader.onreadystatechange = function() {
        if (labelDetailLoader.readyState == 4 && labelDetailLoader.status == 200) {
            let data = JSON.parse(labelDetailLoader.responseText),
                s = '';

            remove_dnone([search_result_text]);

            if (data.length > 0) {
                s = get_notes(data, 'note');
                if (lang == 'ru')
                    search_result_text.innerHTML = 'Записи с ярлыком "';
                else
                    search_result_text.innerHTML = 'Notes with label "';
                search_result_text.innerHTML += document.title + '"';
            } else {
                if (lang == 'ru')
                    search_result_text.innerHTML = 'Нет записей с этим ярлыком.';
                else
                    search_result_text.innerHTML = 'There are no notes with this label.';
            }

            notes_list.innerHTML = s;
        }
    }

    function labelDetailLoad(label_href, label_name) {
        document.title = label_name;
        remove_dnone([notes, search_result_text]);

        send_data(labelDetailLoader, 'GET', label_href, false);
    }

    // Header label name onclick
    label_list.addEventListener('click', function(event) {
        event.preventDefault();
        let closest_li = event.target.closest('li');
        if (!closest_li) return;

        add_dnone([settings]);
        remove_dnone([home_page, notes, trash]);

        let label_name = closest_li.children[0].innerHTML,
            label_id = event.target.id.slice(6);
        labelDetailLoad(domain + '/labels/' + label_id + '/', label_name);
    });


    // noteListLoader
    let notesLoader = new XMLHttpRequest();

    notesLoader.onreadystatechange = function() {
        if (notesLoader.readyState == 4 && notesLoader.status == 200) {
            let data = JSON.parse(notesLoader.responseText),
                s = ``;

            if (data.length > 0) {
                for (let i of data) {
                    s = get_notes(data, 'note');
                }
            } else {
                if (lang == 'ru') s += '<h3 class="pt-4">У Вас пока нет записей</h3>';
                else s += `<h3 class="pt-4">You don't have any notes</h3>`;
            }
            s += '</div></div>'
            notes_list.innerHTML = s;
        }
    }


    // noteDetailLoader
    let noteLoader = new XMLHttpRequest();

    noteLoader.onreadystatechange = function() {
        if (noteLoader.readyState == 4 && noteLoader.status == 200) {
            let data = JSON.parse(noteLoader.responseText);
            edit_note_pk.value = data.pk;
            edit_note_title.value = data.title;
            edit_note_content.value = data.content;

            for (let i of edit_note_form_labels.children) {
                i.children[0].removeAttribute('checked');
                for (let j of data.labels) {
                    if (i.children[0].id == 'edit_' + j) i.children[0].setAttribute('checked', '');
                }
            }

            if (lang == 'ru')
                edit_note_date.innerHTML = 'Изменено в ';
            else if (lang == 'en')
                edit_note_date.innerHTML = 'Edited at ';
            edit_note_date.innerHTML += get_date(data.last_edited_at);
        }
    }

    let selected_notes = [],
        selected_trash = [],
        selecting = false,
        timer;

    function select_note(card) {
        let selected = false,
            id = +card.id.slice(5);

        selecting = true;

        for (let i in selected_notes) {
            if (selected_notes[i] == id) {
                document.getElementById('note_' + id).classList.remove('selected-card');
                selected_notes.splice(i, 1);
                selected = true;
                break;
            }
        }
        if (!selected) {
            selected_notes.push(id);
            card.classList.add('selected-card');
            remove_dnone([delete_button]);
        }
    }

    function select_trash(card) {
        let selected = false,
            id = +card.id.slice(6);

        selecting = true;

        for (let i in selected_trash) {
            if (selected_notes[i] == id) {
                document.getElementById('trash_' + id).classList.remove('selected-card');
                selected_trash.splice(i, 1);
                selected = true;
                break;
            }
        }
        if (!selected) {
            selected_trash.push(id);
            card.classList.add('selected-card');
            remove_dnone([recovery_button, delete_button]);
        }
    }

    document.body.addEventListener('mousedown', function(event) {
        selecting = false;

        if (event.target.tagName == 'A')
            event.preventDefault();

        let card = event.target.closest('div.card');

        if (card) {
            event.preventDefault();

            if (event.target.closest('#notes_list'))
                timer = setTimeout(function() {select_note(card)}, 500);
            else
                timer = setTimeout(function() {select_trash(card)}, 500);
        }

    });

    document.body.addEventListener('mouseup', function(event) {
        clearTimeout(timer);

        if (event.target.tagName == 'SPAN') {
            event.preventDefault();
            labelDetailLoad(event.target.getAttribute('data-href'), event.target.innerHTML);
            return;
        }

        let card = event.target.closest('div.card');
        if (card) {
            event.preventDefault();

            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();

                if (event.target.closest('#notes_list'))
                    select_note(card);
                else
                    select_trash(card);
            } else {
                if (!selecting) {
                    if (event.target.closest('#notes_list')) {
                        edit_note_form.reset();

                        let url = domain + '/note/' + card.children[0].value + '/';
                        send_data(noteLoader, 'GET', url, false);
                        openModal(edit_note_modal);
                    } else if (event.target.closest('#trash_list')) {
                        recovery_note_pk.value = '';
                        recovery_note_title.value = '';
                        recovery_note_content.value = '';

                        let url = domain + '/note/' + card.children[0].value + '/';
                        send_data(trashDetail, 'GET', url, false);
                        openModal(recovery_note_modal);
                    }
                }
            }
        } else {
            add_dnone([recovery_button, delete_button]);
            if (
                event.target.closest('#recovery_button') ||
                event.target.closest('#delete_button') ||
                event.target.closest('#delete_notes_modal_button') ||
                event.target.closest('#recovery_notes_modal_button')
            ) {} else {
                selected_notes = [];
                selected_trash = [];

                for (let i of document.querySelectorAll('.selected-card'))
                    i.classList.remove('selected-card');
            }
        }
    });


    // noteCreater
    let noteCreater = new XMLHttpRequest();

    noteCreater.onreadystatechange = function() {
        if (noteCreater.readyState == 4 && noteCreater.status == 200 || noteCreater.status == 201) {
            refresh();
            if (lang == 'ru') {
                messages.innerHTML = add_message('Успех', 'вы добавили новую запись');
                document.title = 'Ваши запись';
            } else {
                messages.innerHTML = add_message('Success', 'you created a new note');
                document.title = 'Your notes';
            }
            add_dnone([notes]);
            new_note_modal_close.click();
            new_note_form.reset();
        }
    }

    new_note_form.addEventListener('submit', function(event) {
        event.preventDefault();

        let labels = [];
        for (let i of new_note_form_labels.children) {
            let input = i.children[0];
            if (input.checked) labels.push(input.id.slice(4));
        }

        let data = JSON.stringify({
            title: new_note_title.value,
            content: new_note_content.value,
            labels: labels,
        });
        send_data(noteCreater, 'POST', domain + '/note/', data);
    });

    // noteEditor
    let noteEditor = new XMLHttpRequest();

    noteEditor.onreadystatechange = function() {
        if (noteEditor.readyState == 4 && noteEditor.status == 200 || noteEditor.status == 201) {
            refresh();
            if (lang == 'ru')
                messages.innerHTML = add_message('Успех', 'вы обновили запись');
            else
                messages.innerHTML = add_message('Success', 'you updated the note');
            edit_note_modal_close.click();
        }
    }

    edit_note_form.addEventListener('submit', function(event) {
        event.preventDefault();

        let labels = [];
        for (let i of edit_note_form_labels.children) {
            let input = i.children[0];
            if (input.checked) labels.push(input.id.slice(5));
        }

        let pk = edit_note_pk.value,
            data = JSON.stringify({
            pk: pk,
            title: edit_note_title.value,
            content: edit_note_content.value,
            labels: labels,
        });
        send_data(noteEditor, 'PUT', domain + '/note/' + pk + '/', data);
    });


    // Note delete
    let noteDeleter = new XMLHttpRequest();

    noteDeleter.onreadystatechange = function() {
        if (noteDeleter.readyState == 4 && noteDeleter.status == 204) {
            refresh();
            let text = '',
                type = '';

            if (lang == 'ru') {
                text += 'выбранные записи отправлены в корзину';
                type = 'Успех';
            } else {
                text += 'selected notes have been sent to trash';
                type = 'Success';
            }

            messages.innerHTML = add_message(type, text);
        }
    }

    edit_note_delete.addEventListener('click', function() {
        send_data(noteDeleter, 'DELETE', domain + '/note/' + edit_note_pk.value + '/', false);
    });

    delete_button.addEventListener('click', function() {
        if (selected_notes.length > 0) {
            if (lang == 'ru') {
                delete_notes_modal_title.innerHTML = 'Отправить в корзину?';
                delete_notes_modal_description.innerHTML = 'Выбранные записи будут отправлены в корзину. Записи в корзине хранятся 7 дней, позже, удаляются.';
            } else if (lang == 'en') {
                delete_notes_modal_title.innerHTML = 'Send to bin?';
                delete_notes_modal_description.innerHTML = 'Selected notes will be sended to the bin. Notes in the bin will keep 7 days, later, will be deleted.'
            }
        } else if (selected_trash.length > 0) {
            if (lang == 'ru') {
                delete_notes_modal_title.innerHTML = 'Удалить записи?';
                delete_notes_modal_description.innerHTML = 'Выбранные записи будут удалены. Восстановить записи будет невозможно.';
            } else if (lang == 'en') {
                delete_notes_modal_title.innerHTML = 'Delete notes?';
                delete_notes_modal_description.innerHTML = 'Selected notes will be deleted. It will be not possible to restore notes.';
            }
        }

        openModal(delete_notes_modal);
    });

    delete_notes_modal_button.addEventListener('click', function() {
        if (selected_notes.length > 0) {
            for (let i of selected_notes)
                send_data(noteDeleter, 'DELETE', domain + '/note/' + i + '/', false);
        } else if (selected_trash.length > 0) {
            for (let i of selected_trash)
                send_data(trashDeleter, 'DELETE', domain + '/note/' + i + '/', false);
        }
        delete_notes_modal_close.click();
    });


    // Trash delete
    let trashDeleter = new XMLHttpRequest();

    trashDeleter.onreadystatechange = function() {
        if (trashDeleter.readyState == 4 && trashDeleter.status == 204) {
            refresh();
            let text = '',
                type = '';

            if (lang == 'ru') {
                text = 'выбранные записи были удалены';
                type = 'Успех';
            } else {
                text = 'selected notes were been deleted';
                type = 'Success';
            }

            messages.innerHTML = add_message(type, text);
        }
    }

    recovery_note_delete.addEventListener('click', function() {
        send_data(trashDeleter, 'DELETE', domain + '/note/' + recovery_note_pk.value + '/', false);
    });


    // Trash load
    let trashLoader = new XMLHttpRequest();

    trashLoader.onreadystatechange = function() {
        if (trashLoader.readyState == 4 && trashLoader.status == 200) {
            let data = JSON.parse(trashLoader.responseText),
                s = '';

            if (data.length > 0) {
                s = get_notes(data, 'trash');
            } else {
                if (lang == 'ru') s += '<h3 class="mt-4">Корзина пуста</h3>';
                else s += '<h3 class="mt-4">Bin is empty</h3>';
            }
            trash_list.innerHTML = s;
        }
    }


    // Trash detail
    let trashDetail = new XMLHttpRequest();

    trashDetail.onreadystatechange = function() {
        if (trashDetail.readyState == 4 && trashDetail.status == 200) {
            let data = JSON.parse(trashDetail.responseText);
            recovery_note_pk.value = data.pk;
            recovery_note_title.value = data.title;
            recovery_note_content.value = data.content;

            if (lang == 'ru')
                recovery_note_date.innerHTML = 'Изменено в ' + get_date(data.last_edited_at);
            else
                recovery_note_date.innerHTML = 'Edited at ' + get_date(data.last_edited_at);

            for (let i of recovery_note_form_labels.children) {
                i.children[0].removeAttribute('checked');
                for (let j of data.labels) {
                    if (i.children[0].id == 'recovery_' + j) i.children[0].setAttribute('checked', '');
                }
            }
        }
    }


    // Recovery note
    let noteRecovery = new XMLHttpRequest();

    noteRecovery.onreadystatechange = function() {
        if (noteRecovery.readyState == 4 && noteRecovery.status == 201) {
            refresh();
            let type = '',
                text = '';

            if (lang == 'ru') {
                type = 'Успех';
                text = 'вы восстановили выбранные записи';
            } else {
                type = 'Success';
                text = 'you restored selected notes';
            }

            messages.innerHTML = add_message(type, text);
        }
    }

    recovery_note_recovery.addEventListener('click', function() {
        send_data(noteRecovery, 'PUT', domain + '/note/' + recovery_note_pk.value + '/recovery/', false);
    });

    recovery_button.addEventListener('click', function() {
        if (selected_trash.length > 0) {
            if (lang == 'ru') {
                recovery_notes_modal_title.innerHTML = 'Восстановить записи?';
                recovery_notes_modal_description.innerHTML = 'Выбранные записи будут восстановлены.';
            } else if (lang == 'en') {
                recovery_notes_modal_title.innerHTML = 'Restore notes?';
                recovery_notes_modal_description.innerHTML = 'Selected notes will be restored.';
            }
        }

        openModal(recovery_notes_modal);
    });

    recovery_notes_modal_button.addEventListener('click', function() {
        for (let i of selected_trash) {
            send_data(noteRecovery, 'PUT', domain + '/note/' + i + '/recovery/', false);
        }
        recovery_notes_modal_close.click();
    });


    /* Search */
    let searchLoader = new XMLHttpRequest();

    searchLoader.onreadystatechange = function() {
        if (searchLoader.readyState == 4 && searchLoader.status == 200) {
            let data = JSON.parse(searchLoader.responseText),
                s = '';

            search_result_text.classList.remove('d-none')
            if (lang == 'ru')
                search_result_text.innerHTML = 'Результаты по запросу "';
            else
                search_result_text.innerHTML = 'Result for "';
            search_result_text.innerHTML += search_input.value + '" - ' + data.length;

            s += get_notes(data, 'note');

            document.title += ' (' + data.length + ')';

            notes_list.innerHTML = s;

            add_dnone([trash_list]);
            remove_dnone([notes_list, notes, trash]);
            search_input.value = '';
        }
    }

    search_form.addEventListener('submit', function(event) {
        event.preventDefault();
        notes.classList.remove('d-none');

        let data = JSON.stringify({
            keyword: search_input.value,
        });

        send_data(searchLoader, 'POST', domain + '/search/', data);

        if (lang == 'en') document.title = search_input.value + ' - Search results';
        else document.title = search_input.value + ' - Результаты поиска';
    });


    /* Delete avatar */
    delete_avatar_modal_button.addEventListener('click', function(event) {
        document.location.href = event.target.getAttribute('data-href');
    });


    // Switch sort
    let profileSwitcher = new XMLHttpRequest();

    function switchToGrid() {
        let data = JSON.stringify({
            username: profile_form_username.value,
            sort: 'a',
        });
        send_data(profileSwitcher, 'PUT', domain + '/accounts/profile/', data);
    }

    function switchToList() {
        let data = JSON.stringify({
            username: profile_form_username.value,
            sort: 'b',
        });
        send_data(profileSwitcher, 'PUT', domain + '/accounts/profile/', data);
    }


    // labelCreater
    let labelCreater = new XMLHttpRequest();

    labelCreater.onreadystatechange = function() {
        if (labelCreater.readyState == 4 && labelCreater.status == 200 || labelCreater.status == 201) {
            refresh();

            if (lang == 'ru')
                messages.innerHTML = add_message('Успех', 'вы добавили новый ярлык');
            else
                messages.innerHTML = add_message('Success', 'you added a new label');

            new_label_modal_close.click();
            new_label_form.reset();
        }
    }

    let new_label_form = document.getElementById('new_label_form');

    new_label_form.addEventListener('submit', function(event) {
        event.preventDefault();

        let data = JSON.stringify({
            title: new_label_input.value,
        });
        send_data(labelCreater, 'POST', domain + '/labels/', data);
    });


    // Edit label and delete buttons
    label_table.addEventListener('click', function(event) {
        if (event.target.tagName != 'A') return;

        event.preventDefault();
        if (event.target.classList.contains('edit_label_button')) {
            edit_label_form.reset();
            edit_label_input.value = event.target.innerHTML;
            edit_label_form.action = event.target.href;
            openModal(edit_label_modal);
        } else if (event.target.classList.contains('delete_label_button')) {
            label_delete_url.value = event.target.href;
            if (lang == 'ru')
                label_delete_confirm_title.innerHTML = 'Ярлык "' + event.target.closest('div.w-100.d-flex.justify-content-between').children[0].innerHTML + '" будет удален. Он исчезнет со всех записей, при этом сами записи сохранятся.';
            else
                label_delete_confirm_title.innerHTML = 'Label "' + event.target.closest('div.w-100.d-flex.justify-content-between').children[0].innerHTML + '" will be deleted. It will disappear from all notes, while the notes themselves will be saved.';
            openModal(label_delete_confirm);
        }
    });

    // Edit label form submit
    let labelEditor = new XMLHttpRequest();

    labelEditor.onreadystatechange = function() {
        if (labelEditor.readyState == 4 && labelEditor.status == 200 || labelEditor.status == 201) {
            edit_label_modal_close.click();
            refresh();
            if (lang == 'ru')
                messages.innerHTML = add_message('Успех', 'вы изменили ярлык');
            else
                messages.innerHTML = add_message('Success', 'you changed a label');
        }
    }

    edit_label_form.addEventListener('submit', function(event) {
        event.preventDefault();
        let data = JSON.stringify({
            title: edit_label_input.value,
        });
        send_data(labelEditor, 'PUT', edit_label_form.action, data);
    });

    // Delete label
    let labelDeleter = new XMLHttpRequest();

    labelDeleter.onreadystatechange = function() {
        if (labelDeleter.readyState == 4 && labelDeleter.status == 204) {
            refresh();
            if (lang == 'ru')
                messages.innerHTML = add_message('Успех', 'вы удалили ярлык');
            else
                messages.innerHTML = add_message('Success', 'you deleted a label');
        }
    }

    label_delete_confirm_submit.addEventListener('click', function() {
        send_data(labelDeleter, 'DELETE', label_delete_url.value, false);
        label_delete_confirm_close.click()
    });


    // Interface settings
    let interfaceUpdater = new XMLHttpRequest();

    interfaceUpdater.onreadystatechange = function() {
        if (interfaceUpdater.readyState == 4 && interfaceUpdater.status == 200 || interfaceUpdater.status == 201)
            location.reload();
    }

    interface_settings.addEventListener('submit', function(event) {
        event.preventDefault();
        let data, theme, language;

        if (light_theme_switch.checked) theme = 'a';
        else if (dark_theme_switch.checked) theme = 'b';

        if (russian_language_switch.checked) language = 'a';
        else if (english_language_switch.checked) language = 'b';

        data = JSON.stringify({
            username: username,
            theme: theme,
            language: language,
        });

        send_data(interfaceUpdater, 'PUT', domain + '/accounts/profile/', data);
    });


    /* Logout button */
    logout_button.addEventListener('click', function(event) {
        document.location.href = domain + event.target.getAttribute('data-href');
    });


    /* Profile delete form */
    profile_delete_link.addEventListener('click', function(event) {
        event.preventDefault();
        profile_delete_form_password.value = '';
        openModal(profile_delete_modal);
    });

    let profileDeleter = new XMLHttpRequest();

    profileDeleter.onreadystatechange = function() {
        if (profileDeleter.readyState == 4) {
            if (profileDeleter.status == 204) {
                document.location.href = profile_delete_link.href;
            } else if (profileDeleter.status == 400) {
                refresh();
                let type = '',
                    text = '';

                if (lang == 'ru') {
                    type = 'Ошибка';
                    text = 'неверный пароль';
                } else {
                    type = 'Error';
                    text = 'incorrect password';
                }

                messages.innerHTML = add_message(type, text);
            }

            profile_delete_modal_close.click();
        }
    }

    profile_delete_form.addEventListener('submit', function() {
        event.preventDefault();
        let data = JSON.stringify({
            password: profile_delete_form_password.value,
        });
        send_data(profileDeleter, 'DELETE', domain + '/accounts/profile/', data);
    });


    /* Some header buttons */
    // Switch to trash
    trash.addEventListener('click', function() {
        event.preventDefault();
        add_dnone([settings, trash, notes_list, labels_dropdown]);
        remove_dnone([home_page, notes, trash_list, trash_list_wrapper]);

        refresh();

        if (lang == 'en') document.title = 'Trash';
        else document.title = 'Корзина';
    });
    // Switch to notes
    notes.addEventListener('click', function() {
        event.preventDefault();

        add_dnone([settings, notes, trash_list, search_result_text, recovery_button, delete_button]);
        remove_dnone([home_page, trash, notes_list, labels_dropdown]);

        refresh();

        if (lang == 'en') document.title = 'Your notes';
        else document.title = 'Ваши записи';
    });
    // Switch to settings
    function to_settings(event) {
        event.preventDefault();

        add_dnone([home_page])
        remove_dnone([settings, notes, trash, labels_dropdown]);

        if (lang == 'en') document.title = 'Settings';
        else document.title = 'Настройки';
    }
    profile_mobile.addEventListener('click', to_settings);
    profile_desktop.addEventListener('click', to_settings);


    // Switch to list
    list.addEventListener('click', function() {
        let cols = document.querySelectorAll('.col-for-card');
        for (let col of cols) {
            col.classList.remove('col-xl-3');
            col.classList.remove('col-lg-4');
            col.classList.remove('col-md-6');
            col.classList.remove('col-sm-12');
            col.classList.add('col-12');
        }
        switchToList();
        list.classList.remove('d-md-flex');
        grid.classList.add('d-md-flex');
    });

    // Switch to grid
    grid.addEventListener('click', function() {
        let cols = document.querySelectorAll('.col-for-card');
        for (let col of cols) {
            col.classList.remove('col-12');
            col.classList.add('col-xl-3');
            col.classList.add('col-lg-4');
            col.classList.add('col-md-6');
            col.classList.add('col-sm-12');
        }
        switchToGrid();
        list.classList.add('d-md-flex');
        grid.classList.remove('d-md-flex');
    });

    // Refresh button
    function refresh() {
        send_data(profileLoader, 'GET', domain + '/accounts/profile/', false);
        send_data(notesLoader, 'GET', domain + '/note/', false);
        send_data(trashLoader, 'GET', domain + '/note/deleted/', false);
        send_data(labelsLoader, 'GET', domain + '/labels/', false);
        messages.innerHTML = '';
        search_result_text.innerHTML = '';
        search_input.value = '';
    }

    refresh_button.addEventListener('click', function() {
        refresh();
        django_messages.innerHTML = '';
    });

    refresh();
}