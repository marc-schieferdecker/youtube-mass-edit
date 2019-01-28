/**
 * Application functions
 * =====================
 */

/**
 * Search and replace
 */
function searchAndReplace() {
    let reg = $('#regex').is(':checked');
    let replacenl = $('#replacenewlines').is(':checked');
    let s = $('#search').val();
    let r = replacenl ? $('#replace').val().replace("\\n", "\n") : $('#replace').val();
    let changeCounter = 0;

    if(s.length) {
        $('.video-description').each( function(index) {
                c = $(this).val();
                if(reg) {
                    let expr = regExpFromString(s);
                    if(expr) {
                        $(this).val(c.replace(expr,r).trim());
                    }
                    else {
                        alert('RegEx error.');
                    }
                }
                else {
                    $(this).val(c.replace(s,r).trim());
                }
                if($(this).val() !== c) {
                    changeCounter++;
                    markVideoAsChanged($(this));
                }
            }
        );
        if(changeCounter) {
            showModal( 'Results', (changeCounter+1) + ' videos where changed.' );
            $('#submitVideos').removeClass('d-none');
        }
        else {
            showModal( 'Results', 'No changes applied.' );
        }
    }
}

/**
 * Set replacement template
 * @param tpl
 */
function applyReplacemenetTemplate( tpl ) {
    if( tpl === 1) {
        $('#regex').attr('checked', true);
        $('#replacenewlines').attr('checked', true);
        $('#search').val("/^\\s*[\\r\\n]/gm");
        $('#replace').val("\\n");
    }
}

/**
 * Reload video page (when loading videos)
 * @param timeBeforeReload
 */
function reloadVideoPage( timeBeforeReload ) {
    timeBeforeReload = typeof timeBeforeReload === 'undefined' ? 3000 : timeBeforeReload;
    setTimeout( () => {
        location.reload();
    }, timeBeforeReload);
}

/**
 * Show bootstrap modal
 * @param title
 * @param body
 * @param modalId
 * @param titleId
 * @param bodyId
 */
function showModal( title, body, modalId, titleId, bodyId) {
    modalId = typeof modalId === 'undefined' ? 'appModal' : modalId;
    titleId = typeof titleId === 'undefined' ? 'appModalLabel' : titleId;
    bodyId = typeof bodyId === 'undefined' ? 'appModalBody' : bodyId;
    $('#'+titleId).html(title);
    $('#'+bodyId).html(body);
    $('#'+modalId).modal('show');
}

/**
 * Helper functions
 * ================
 */

/**
 * Create regex from string
 * @param q
 * @returns {*}
 */
function regExpFromString(q) {
    let flags = q.replace(/.*\/([gimuy]*)$/, '$1');
    if (flags === q) flags = '';
    let pattern = (flags ? q.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1') : q);
    try { return new RegExp(pattern, flags); } catch (e) { return null; }
}

/**
 * Mark video that it has been changed
 * @param el
 */
function markVideoAsChanged(el) {
    el.parent().addClass('changed');
    el.parent().removeClass('notchanged');
    el.parent().prev().addClass('changed');
    el.parent().prev().removeClass('notchanged');
    $('#submitVideos').removeClass('d-none');
}