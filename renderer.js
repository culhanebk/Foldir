const { shell } = require('electron')
const os = require('os')
const fs = require('fs')
const Datastore = require('nedb-promises')
const path = require('path')
const res = [];
const db = Datastore.create({ filename: path.join(require('electron').remote.app.getPath('userData'), 'bookmarks.db') });
const folderRootEl = document.getElementById('folderRoot')
var bookmarks = []
var folders = []
//db.remove({})
document.getElementById("test").focus();
var search = ''

const searchBox = document.getElementById('test')

var folderRoot = 'c:\\users\\culha\\'
GetFolders(folderRoot)
folderRootEl.innerHTML = folderRoot

let html = document.documentElement

document.addEventListener('click', (e) => {
    let { target } = e
    let newTheme = target.getAttribute('data-set-theme')

    if (newTheme) {
        html.setAttribute('data-theme', newTheme)
        localStorage.theme = newTheme
    }
})



db.find({}).then((result) => {

    bookmarks = result;
    makeListBM(result)
    //console.log(result);
}).catch((err) => {
    console.log(err);
});

searchBox.addEventListener('keydown', function (e) {
    if (e.keyCode == '9') {
        e.preventDefault();
        e.stopPropagation();
        var folderRootEl = document.getElementById('folderRoot')
        if (folders.length == 1) {
            var folderRoot = folderRootEl.innerHTML + folders[0] + '\\'
            folderRootEl.innerHTML = folderRoot
            GetFolders(folderRoot)
            searchBox.value = ''
            return
        }

        folders.push(folders.shift());
        makeList(folders);
        // var text = document.getElementById('test')
        // var strFolders = folders.join(' | ')
        // text.value = ' ' + strFolders
        // text.focus()
        // text.setSelectionRange(0, 0)
    }

}, false);

searchBox.addEventListener('keyup', (e) => {
    //   shell.showItemInFolder(os.homedir())
    console.log(event);
    var folderRootEl = document.getElementById('folderRoot')
    var lastIndex = searchBox.value.lastIndexOf('\\')
    search = searchBox.value
 
    console.log(lastIndex);
    if (folderRootEl.innerHTML.length > 0 || lastIndex != -1) {

        if (lastIndex != -1) {


            var folderRoot = searchBox.value.substr(0, lastIndex + 1)
            folderRootEl.innerHTML = folderRoot
            GetFolders(folderRoot)

        } else {

            //nav up
            if (search == '..') {
                folderRoot = folderRootEl.innerHTML.split('\\');
                folderRoot.splice(-1,1);
                folderRoot.splice(-1,1);
                var backupFolder = folderRoot.join('\\');
                folderRootEl.innerHTML = backupFolder + '\\';
                GetFolders(backupFolder + '\\',function(data){
                    
                });
                searchBox.value = ''
            }

            //bookmarks order
            if (e.altKey && e.keyCode == 88) {

                bookmarks.push(bookmarks.shift());
                makeListBM(bookmarks);
                var folderRoot = bookmarks[0].bookmark;
                folderRootEl.innerHTML = folderRoot
                GetFolders(folderRoot,function(data){
                    
                });
                searchBox.value = ''
            }

            if (e.altKey && e.keyCode == 68) {

                db.remove({_id:bookmarks[0]._id})
                bookmarks.shift();
                makeListBM(bookmarks);
                var folderRoot = bookmarks[0].bookmark;
                folderRootEl.innerHTML = folderRoot
                GetFolders(folderRoot,function(data){
                    
                });
                searchBox.value = ''
            }

            if (e.key == 'Enter') {
                var folderRoot = folderRootEl.innerHTML + folders[0] + '\\'
                folderRootEl.innerHTML = folderRoot
                GetFolders(folderRoot,function(data){
                    
                });
                searchBox.value = ''
            }
            if (e.ctrlKey && e.keyCode == 68) {
                var folderRoot = folderRootEl.innerHTML + folders[0] + '\\'
                const nodeCmd = require('node-cmd');
                nodeCmd.get('code ' + folderRoot, (err, data, stderr) => console.log(data));

            }
            //Open folder in CMD as admin
            if (e.ctrlKey && e.keyCode == 84) {
                var folderRoot = folderRootEl.innerHTML + folders[0] + '\\'
                const nodeCmd = require('node-cmd');
                nodeCmd.get('powershell -c start -verb runas cmd -ArgumentList \'"/k cd ' + folderRoot + '"\'', (err, data, stderr) => console.log(data));

            }


            //Open folder in CMD as admin
            if (e.ctrlKey && e.keyCode == 69) {
                var folderRoot = folderRootEl.innerHTML + folders[0] + '\\'
                const nodeCmd = require('node-cmd');
                nodeCmd.get('start %windir%\\explorer.exe ' + folderRoot, (err, data, stderr) => console.log(data));

            }



            if (e.ctrlKey && e.keyCode == 66) {


                var folderRoot = folderRootEl.innerHTML + folders[0] + '\\'
             

                db.find({ bookmark: folderRoot }).then((result) => {
                    if (result.length == 0) {


                        db.insert([{ bookmark: folderRoot }], function (err, newDoc) {   // Callback is optional
                            // newDoc is the newly inserted document, including its _id
                            // newDoc has no key called notToBeSaved since its value was undefined
                        });
                        db.find({}).then((result) => {
                            console.log(result);
                            makeListBM(result)
                            //console.log(result);
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                    return;
                }).catch((err) => {
                    console.log(err);
                });


            }

            if (e.keyCode == 8) {
                var folderRoot = folderRootEl.innerHTML
                GetFolders(folderRoot,function(data){
                    
                    search = searchBox.value
                    var newfoldersSearch = data.filter(f => f.toLowerCase().indexOf(search.toLowerCase()) !== -1)
                    makeList(newfoldersSearch);
                    
                })
         
            } else {

                
                folders = folders.filter(f => f.toLowerCase().indexOf(search.toLowerCase()) !== -1)
                makeList(folders);
            }

        }

    }


});

function GetFolders(folderRoot,rtn) {
    if (folderRoot != null) {
        fs.readdir(folderRoot, function (err, items) {

            for (var i = 0; i < items.length; i++) {
                console.log(items[i]);
            }
            folders = items.filter(x => x.indexOf('$') === -1)
            makeList(folders);
            rtn(folders);
           // return folders
            // var text = document.getElementById('test')
            // var strFolders = folders.join(' | ')
            // text.value = ' ' + strFolders
            // text.focus()
            // text.setSelectionRange(0, 0)
        });
    }
}


function makeList(folders) {
    // Establish the array which acts as a data source for the list
    var elementExists = document.getElementById("folderResult");
    console.log(elementExists);
    if (elementExists != null) {
        elementExists.remove()
    }
    // Make a container element for the list
    var listContainer = document.createElement('div');
    listContainer.setAttribute('id', 'folderResult')
    // Add it to the page
    document.getElementsByTagName('folder')[0].appendChild(listContainer);

    // Make the list
    var listElement = document.createElement('ul');

    // Add it to the page
    listContainer.appendChild(listElement);

    // Set up a loop that goes through the items in listItems one at a time
    var numberOfListItems = folders.length;

    for (var i = 0; i < numberOfListItems; ++i) {
        // create an item for each one
        var listItem = document.createElement('li');

        if(folders[i].indexOf('.') == -1){
            var folderIcons = 'fas fa-folder';
        }

        if(folders[i].indexOf('.') == 0){
            var folderIcons = 'fas fa-file-times';
        }

        switch (folders[i].split(".").pop()) {
            case 'mp4':
            var folderIcons = 'fas fa-mandolin';
                break;
        
            case 'cs':

            var folderIcons = 'fas fa-code';
                break;
        }
       

        // Add the item text
        listItem.innerHTML = '<i class="' + folderIcons +  '"></i>     ' + folders[i];

        // Add listItem to the listElement
        listElement.appendChild(listItem);
    }
}



function makeListBM(folders) {
    // Establish the array which acts as a data source for the list
    var elementExists = document.getElementById("bookmarks");
    console.log(elementExists);
    if (elementExists != null) {
        elementExists.remove()
    }

    // Make a container element for the list
    var listContainer = document.createElement('div');
    listContainer.setAttribute('id', 'bookmarks')
    // Add it to the page
    document.getElementsByTagName('nav')[0].appendChild(listContainer);

    // Make the list
    var listElement = document.createElement('ul');

    // Add it to the page
    listContainer.appendChild(listElement);

    // Set up a loop that goes through the items in listItems one at a time
    var numberOfListItems = folders.length;

    for (var i = 0; i < numberOfListItems; ++i) {
        // create an item for each one
        var listItem = document.createElement('li');
        listItem.setAttribute('id', folders[i]._id)
        var listicon = document.createElement('i');
        listicon.setAttribute('class', 'fal fa-folder')
        // Add the item text
        listItem.innerHTML = '<i class="fas fa-folder"></i> ' + folders[i].bookmark;

        // Add listItem to the listElement
        listElement.appendChild(listItem);
    }
}