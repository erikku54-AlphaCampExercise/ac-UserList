const BASE_URL="https://user-list.alphacamp.io";
const SHOW_API_URL=BASE_URL+"/api/v1/users";
const INDEX_API_URL=BASE_URL+"/api/v1/users/";
const STORAGE_KEY="favorite_users"
const USERS_PER_PAGE=18;

const users=[];
const favorite = JSON.parse(localStorage.getItem(STORAGE_KEY))||[];
let filteredUsers=[];

const navFavorite=document.querySelector("a#nav-favorite");

const cardPanel=document.querySelector("div#card-panel");
const pageRow=document.querySelector("ul#page-row");

const searchForm=document.querySelector("form#search-form");
const inputKeyword=document.querySelector("input#keyword");

const modalTitle=document.querySelector("h5.modal-title");
const modalImage=document.querySelector("img#modal-image");
const modalInfo=document.querySelector("div#modal-info");
const modalBtnAdd=document.querySelector("button#modal-btn-add");
const modalBtnRemove=document.querySelector("button#modal-btn-remove");



navFavorite.innerHTML=`Favorite(<b>${favorite.length}</b>)`;

renderPagination(favorite.length);
renderCards(favorite);
goToPage(1);


function renderCards(userlist){

    let htmlText=""

    for(const user of userlist){

        htmlText+=`<div class="card m-2 card-user" style="width: 12rem;" data-bs-toggle="modal" data-bs-target="#userModal">
        <a class="btn stretched-link btn-user" data-index="${user.id}">
        <img src="${user.avatar}" class="card-img-top" style="min-heigt:100%;" alt="user pic">
        <div class="card-body">
          <h5 class="card-title">${user.name}</h5>
        </div></a>
        </div>`;
    }

    cardPanel.innerHTML=htmlText;
}

function renderPagination(length){

    const totalPages=Math.ceil(length/USERS_PER_PAGE);

    pageRow.innerHTML="";

    for (let i=1;i<=totalPages;i++){
          
          pageRow.innerHTML+=`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
}

function getUsersByPage(page){

    const start=(page-1)*USERS_PER_PAGE;
    const end=start+USERS_PER_PAGE;

    //依據filteredUser是否為空來決定資料來源
    const data=filteredUsers.length? filteredUsers:favorite;

    return data.slice(start,end);
}

function goToPage(page){

    //新分頁須設置為active, 其餘則取消active
    const liPages=pageRow.querySelectorAll('li.page-item');

    for (let i=1;i<=liPages.length;i++){

        if(i===page){
            liPages[i-1].classList.add('active');
            liPages[i-1].setAttribute('aria-current','page');
        }else{
            liPages[i-1].classList.remove('active');
            liPages[i-1].removeAttribute('aria-current');
        }
    }

    renderCards(getUsersByPage(page));
}


//動作：切換頁碼
pageRow.addEventListener('click',(event)=>{

    if(event.target.tagName!=="A") return;

    goToPage(Number(event.target.textContent));

})


//動作：顯示詳細資訊
cardPanel.addEventListener("click",(event)=>{

    if(event.target.matches("a.btn-user")){

        modalTitle.innerHTML='';
        modalImage.src='';
        modalInfo.innerHTML='';
        modalBtnAdd.dataset.index="";
        modalBtnRemove.dataset.index="";
        modalBtnAdd.removeAttribute('style');
        modalBtnRemove.setAttribute('style','display: none;');

        const index=event.target.dataset.index;

        axios.get(INDEX_API_URL+index).then((response)=>{

            const obj=response.data;

            modalTitle.innerHTML=`<b>${obj.name} ${obj.surname}</b>`;

            modalImage.setAttribute("src",`${obj.avatar}`);

            modalInfo.innerHTML=`<p class="p-modal"><b>age:</b> ${obj.age}</p>
            <p class="p-modal"><b>gender:</b> ${obj.gender}</p>
            <p class="p-modal"><b>region:</b> ${obj.region}</p>
            <p class="p-modal"><b>birthday:</b> ${obj.birthday}</p>
            <p class="p-modal"><b>email:</b> ${obj.email}</p>
            <br/>
            <p class="p-modal"><b>created at:</b> ${obj.created_at}</p>
            <p class="p-modal"><b>updated at:</b> ${obj.updated_at}</p>`;

            modalBtnAdd.dataset.index=obj.id;
            modalBtnRemove.dataset.index=obj.id;

            if(favorite.some((user)=>user.id===obj.id)){

                modalBtnAdd.setAttribute('style','display: none;');
                modalBtnRemove.removeAttribute('style');

            }

        }).catch((err)=>console.log(err));
    }
});


//動作：增加至我的最愛
modalBtnAdd.addEventListener('click',(event)=>{

    const newID = Number(event.target.dataset.index);
    
    if(favorite.some((user)=>user.id === newID)) return;

    const newUser = users.find((user)=>user.id === newID);
    favorite.push(newUser);

    localStorage.setItem(STORAGE_KEY,JSON.stringify(favorite));

    //變更按鈕及導覽列
    modalBtnAdd.setAttribute('style','display: none;');
    modalBtnRemove.removeAttribute('style');

    navFavorite.innerHTML=`Favorite(<b>${favorite.length}</b>)`;
});


//動作：移除我的最愛
modalBtnRemove.addEventListener('click',(event)=>{

    const targetID = Number(event.target.dataset.index);

    const removeIndex=favorite.findIndex((user)=>user.id === targetID);

    if (removeIndex==-1) return;
    favorite.splice(removeIndex,1);

    localStorage.setItem(STORAGE_KEY,JSON.stringify(favorite));

    //變更按鈕及導覽列,並重新render頁面
    modalBtnAdd.removeAttribute('style');
    modalBtnRemove.setAttribute('style','display: none;');

    navFavorite.innerHTML=`Favorite(<b>${favorite.length}</b>)`;
    renderPagination(favorite.length);
    renderCards(favorite);
    goToPage(1);
});


//動作：搜尋
searchForm.addEventListener('submit',(event)=>{

    event.preventDefault();

    const keyword=inputKeyword.value.toLowerCase().trim();

    // console.log(keyword);

    //篩選對象為favorite而非users
    filteredUsers = favorite.filter((user)=>(
    user.name.toLowerCase().includes(keyword)||user.surname.toLowerCase().includes(keyword)));

    // console.log(filteredUsers);

    //重新渲染畫面
    renderPagination(filteredUsers.length);
    renderCards(filteredUsers);

    goToPage(1);
});

