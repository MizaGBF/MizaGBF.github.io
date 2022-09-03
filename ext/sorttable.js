/** ce code a été lourdement patché et mis à jour. **/

/*
  SortTable
  version 2
  7th April 2007
  Stuart Langridge, http://www.kryogenix.org/code/browser/sorttable/

  Instructions:
  Download this file
  Add <script src="sorttable.js"></script> to your HTML
  Add class="sortable" to any table you'd like to make sortable
  Click on the headers to sort

  Thanks to many, many people for contributions and suggestions.
  Licenced as X11: http://www.kryogenix.org/code/browser/licence.html
  This basically means: do what you want with it.
*/

var sorttable = {

    selector_tables : 'table.sortable',
    class_sort_bottom : 'sortbottom',
    class_no_sort : 'sorttable_nosort',
    class_sorted : 'sorttable_sorted',
    class_sorted_reverse : 'sorttable_sorted_reverse',
    id_sorttable_sortfwdind : 'sorttable_sortfwdind',
    id_sorttable_sortfrevind : 'sorttable_sortrevind',
    icon_up : '&nbsp;&#x25B4;',
    icon_down : '&nbsp;&#x25BE;',

    regex_non_decimal : /[^0-9\.\-]/g,
    regex_trim : /^\s+|\s+$/g,
    regex_any_sorttable_class : /\bsorttable_([a-z0-9]+)\b/,

    init: function() {
        // quit if this function has already been called
        if (arguments.callee.done) return;
        // flag this function so we don't do the same thing twice
        arguments.callee.done = true;

        sorttable.forEach(document.querySelectorAll(sorttable.selector_tables), sorttable.makeSortable);
    },

    insert_thead_in_table : function(table_element) {
        if (table_element.getElementsByTagName('thead').length === 0) {
            // table doesn't have a tHead. Since it should have, create one and
            // put the first table row in it.
            thead_element = document.createElement('thead');
            thead_element.appendChild(table_element.rows[0]);
            table_element.insertBefore(thead_element,table_element.firstChild);
        }        
    },

    forEach : function(object, block, context) {
        /* ******************************************************************
          Supporting functions: bundled here to avoid depending on a library
        ****************************************************************** */
       // globally resolve forEach enumeration
        if (object) {
            var resolve = Object; // default
            if (object instanceof Function) {
                // functions have a "length" property
                resolve = Function;
            } else if (object.forEach instanceof Function) {
                // the object implements a custom forEach method so use that
                object.forEach(block, context);
                return;
            } else if (typeof object == "string") {
                // the object is a string
                resolve = String;
            } else if (typeof object.length == "number") {
                // the object is array-like
                resolve = Array;
            }
            resolve.forEach(object, block, context);
        }
    },

    innerSortFunction : function(event) {

        if (this.classList.contains(sorttable.class_sorted)) {
            // if we're already sorted by this column, just
            // reverse the table, which is quicker
            sorttable.reverse(this.sorttable_tbody);
            this.classList.remove(sorttable.class_sorted);
            this.classList.add(sorttable.class_sorted_reverse);
            this.removeChild(document.getElementById(sorttable.id_sorttable_sortfwdind));
            sortrevind = document.createElement('span');
            sortrevind.id = sorttable.id_sorttable_sortfrevind;
            sortrevind.innerHTML = sorttable.icon_up;
            this.appendChild(sortrevind);
            event.preventDefault();
            return;
        }

        if (this.classList.contains(sorttable.class_sorted_reverse)) {
            // if we're already sorted by this column in reverse, just
            // re-reverse the table, which is quicker
            sorttable.reverse(this.sorttable_tbody);
            this.classList.remove(sorttable.class_sorted_reverse);
            this.classList.add(sorttable.class_sorted);
            this.removeChild(document.getElementById(sorttable.id_sorttable_sortfrevind));
            sortfwdind = document.createElement('span');
            sortfwdind.id = sorttable.id_sorttable_sortfwdind;
            sortfwdind.innerHTML = sorttable.icon_down;
            this.appendChild(sortfwdind);
            event.preventDefault();
            return;
        }

        // remove sorttable_sorted classes
        theadrow = this.parentNode;
        sorttable.forEach(theadrow.childNodes, function(cell) {
        if (cell.nodeType == 1) { // an element
            cell.classList.remove(sorttable.class_sorted_reverse);
            cell.classList.remove(sorttable.class_sorted);
        }
        });
        sortfwdind = document.getElementById(sorttable.id_sorttable_sortfwdind);
        if (sortfwdind) {
            sortfwdind.parentNode.removeChild(sortfwdind); 
        }
        sortrevind = document.getElementById(sorttable.id_sorttable_sortfrevind);
        if (sortrevind) {
            sortrevind.parentNode.removeChild(sortrevind);
        }

        this.classList.add(sorttable.class_sorted);
        sortfwdind = document.createElement('span');
        sortfwdind.id = sorttable.id_sorttable_sortfwdind;
        sortfwdind.innerHTML = sorttable.icon_down;
        this.appendChild(sortfwdind);

        // build an array to sort. This is a Schwartzian transform thing,
        // i.e., we "decorate" each row with the actual sort key,
        // sort based on the sort keys, and then put the rows back in order
        // which is a lot faster because you only do getInnerText once per row
        row_array = [];
        col = this.sorttable_columnindex;
        rows = this.sorttable_tbody.rows;
        for (var j=0; j<rows.length; j++) {
            row_array[row_array.length] = [sorttable.getInnerText(rows[j].cells[col]), rows[j]];
        }
        /* If you want a stable sort, uncomment the following line */
        //sorttable.shaker_sort(row_array, this.sorttable_sortfunction);
        /* and comment out this one */
        row_array.sort(this.sorttable_sortfunction);

        tb = this.sorttable_tbody;
        for (var j=0; j<row_array.length; j++) {
            tb.appendChild(row_array[j][1]);
        }
        event.preventDefault();

        delete row_array;
    },

    makeSortable: function(table_element) {
        sorttable.insert_thead_in_table(table_element);

        // Safari doesn't support table.tHead, sigh
        if (table_element.tHead == null) {
            table_element.tHead = table_element.getElementsByTagName('thead')[0];
        } 

        if (table_element.tHead.rows.length != 1) return; // can't cope with two header rows

        // Sorttable v1 put rows with a class of "sortbottom" at the bottom (as
        // "total" rows, for example). This is B&R, since what you're supposed
        // to do is put them in a tfoot. So, if there are sortbottom rows,
        // for backwards compatibility, move them to tfoot (creating it if needed).
        var sortbottomrows = [];
        for (var i=0; i<table_element.rows.length; i++) {
            if (table_element.rows[i].classList.contains(sorttable.class_sort_bottom)) {
                sortbottomrows[sortbottomrows.length] = table_element.rows[i];
            }
        }
        if (sortbottomrows) {
            if (table_element.tFoot == null) {
                // table doesn't have a tfoot. Create one.
                var tfoot_element = document.createElement('tfoot');
                table_element.appendChild(tfoot_element);
            }
            for (var i=0; i<sortbottomrows.length; i++) {
                tfoot_element.appendChild(sortbottomrows[i]);
            }
        }

        // work through each column and calculate its type
        var headrow = table_element.tHead.rows[0].cells;
        for (var i=0; i<headrow.length; i++) {
            // manually override the type with a sorttable_type attribute
            if (!headrow[i].classList.contains(sorttable.class_no_sort)) { 
                // skip this col
                mtch = headrow[i].className.match(sorttable.regex_any_sorttable_class);
                if (mtch) {
                    override = mtch[1];
                }
                if (mtch && typeof sorttable["sort_"+override] == 'function') {
                    headrow[i].sorttable_sortfunction = sorttable["sort_"+override];
                } else {
                    headrow[i].sorttable_sortfunction = sorttable.guessType(table_element,i);
                }
                // make it clickable to sort
                headrow[i].sorttable_columnindex = i;
                headrow[i].sorttable_tbody = table_element.tBodies[0];
                headrow[i].addEventListener("click", sorttable.innerSortFunction);
            }
        }
    },

    guessType: function(table, column) {
        // guess the type of a column based on its first non-blank row
        return sorttable.sort_alpha;
    },

    getInnerText: function(node) {
        // gets the text we want to use for sorting for a cell.
        // strips leading and trailing whitespace.
        // this is *not* a generic getInnerText function; it's special to sorttable.
        // for example, you can override the cell text with a customkey attribute.
        // it also gets .value for <input> fields.

        if (!node) return "";

        if ((node.dataset !== undefined) && (node.dataset.value !== undefined)) {
            return node.dataset.value;
        }

        hasInputs = (typeof node.getElementsByTagName == 'function') && node.getElementsByTagName('input').length;

        if (node.getAttribute("sorttable_customkey") != null) {
            return node.getAttribute("sorttable_customkey");
        }
        
        if (typeof node.textContent != 'undefined' && !hasInputs) {
            return node.textContent.replace(sorttable.regex_trim, '');
        }
        if (typeof node.innerText != 'undefined' && !hasInputs) {
            return node.innerText.replace(sorttable.regex_trim, '');
        }

        if (typeof node.text != 'undefined' && !hasInputs) {
            return node.text.replace(sorttable.regex_trim, '');
        }

        switch (node.nodeType) {
            case 3:
                if (node.nodeName.toLowerCase() == 'input') {
                    return node.value.replace(sorttable.regex_trim, '');
                }
            case 4:
                return node.nodeValue.replace(sorttable.regex_trim, '');
                break;
            case 1:
            case 11:
                var innerText = '';
                for (var i = 0; i < node.childNodes.length; i++) {
                    innerText += sorttable.getInnerText(node.childNodes[i]);
                }
                return innerText.replace(sorttable.regex_trim, '');
                break;
            default:
                return '';
        }
    },

    reverse: function(tbody) {
        // reverse the rows in a tbody
        var newrows = [];
        for (var i=0; i<tbody.rows.length; i++) {
          newrows[newrows.length] = tbody.rows[i];
        }
        for (var i=newrows.length-1; i>=0; i--) {
           tbody.appendChild(newrows[i]);
        }
    },

    /* sort functions
         each sort function takes two parameters, a and b
         you are comparing a[0] and b[0] */
    sort_numeric: function(a,b) {
        var aa = parseFloat(a[0].replace(sorttable.regex_non_decimal,''));
        if (isNaN(aa)) aa = 0;
        var bb = parseFloat(b[0].replace(sorttable.regex_non_decimal,''));
        if (isNaN(bb)) bb = 0;
        return aa-bb;
    },

    sort_alpha: function(a,b) {
        if (a[0]==b[0]) return 0;
        if (a[0]<b[0]) return -1;
        return 1;
    },

    shaker_sort: function(list, comp_func) {
        // A stable sort function to allow multi-level sorting of data
        // see: http://en.wikipedia.org/wiki/Cocktail_sort
        // thanks to Joseph Nahmias
        var b = 0;
        var t = list.length - 1;
        var swap = true;

        while(swap) {
            swap = false;
            for(var i = b; i < t; ++i) {
                if ( comp_func(list[i], list[i+1]) > 0 ) {
                    var q = list[i]; list[i] = list[i+1]; list[i+1] = q;
                    swap = true;
                }
            } // for
            t--;

            if (!swap) break;

            for(var i = t; i > b; --i) {
                if ( comp_func(list[i], list[i-1]) < 0 ) {
                    var q = list[i]; list[i] = list[i-1]; list[i-1] = q;
                    swap = true;
                }
            } // for
            b++;

        } // while(swap)
    }
}

