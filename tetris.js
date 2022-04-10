import BLOCKS from "./blocks.js";

//#DOM
const playground = document.querySelector(".playground > ul");//#querySelector, #querySelectorAll #getElementById
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");

//SETTING
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500;//블록 떨어지는 시간
let downInterval;
let tempMovingItem;


const movingItem = {//기초세팅
    type : "",
    direction: 0,
    top: 0,
    left: 3,

};

init();

//functions
function init() {//시작함수
    tempMovingItem = {...movingItem}; //#spread  #rest
   
    for(let i= 0; i<GAME_ROWS; i++){//
        prependNewLine();//
    }
    generateNewBlock()
}



function prependNewLine() {//줄만들기 (완성)
    const li = document.createElement("li");// #node와 element(DOM)
    const ul = document.createElement("ul");
    for(let j=0 ; j<GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);         //#prepend  #append
    }
    li.prepend(ul);
    playground.prepend(li);
}

function renderBlocks(moveType="") {
    const {type, direction, top, left } = tempMovingItem; //#비구조화 할당
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");//#classList(add, remove, contains 등등)
    })
    BLOCKS[type][direction].some(block => { //#forEach  #map #filter #some #every !!!!!!!!!!!
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ?  playground.childNodes[y].childNodes[0].childNodes[x]: null;// #childNodes
        const isAvailable = checkEmpty(target);
        if(isAvailable) {
            target.classList.add(type, "moving");   //type과 moving 추가
        }
        else {
            tempMovingItem = {...movingItem};
            if(moveType==='retry'){
                clearInterval(downInterval)
                showGameOverText()
            }
            setTimeout(() => { //#setTimeout()
                renderBlocks('retry')
                if(moveType === "top"){     //바닥에 닿으면 더 안 내려가게
                    seizeBlock();
                }
                
            }, 0);
            return true;
            
        }
    })
    movingItem.left = left;
    movingItem.top =  top;
    movingItem.direction = direction;
}

function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");//moving 빼버려서 더이상 안 움직임
        moving.classList.add("seized");
    })
    checkMatch()
    
}

function checkMatch(){
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {//forEach는 ul(child.children[0])(한줄) 내의 li(한칸)를 하나씩 돌려보는것
            if(!li.classList.contains("seized")){//블럭으로 채워진 li는 seized를 갖고 있어야 함
                matched = false;
            }
        });  
        if(matched){
            child.remove();//꽉찬 한 줄이 없어지고
            prependNewLine();//새로 한 줄 추가
            score = score+100;
            scoreDisplay.innerText = score;

        }
    })
    generateNewBlock()
}

function generateNewBlock() { //#setInterval() #clearInternal()

    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, duration)
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()* blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left=3;//중간에 오게
    movingItem.direction = 0;
    tempMovingItem = {...movingItem};
    renderBlocks()

}


function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}
 
function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction +=1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top",1)
    },10)
}

function showGameOverText(){
    gameText.style.display = "flex"
}

//event handling
document.addEventListener("keydown", e => {
    switch(e.keyCode){
        case 39://오른쪽으로
            moveBlock("left", 1);
            break;
        case 37://왼쪽으로
            moveBlock("left", -1);
            break;
        case 40://아래로
            moveBlock("top", 1);
            break;
        case 38://위방향키로 direction 바꾸기
            changeDirection();
            break;
        case 32://spacebar
            dropBlock()
            break;
        default:
            break;
    }
    console.log(e);
})

restartButton.addEventListener("click", ()=> {
    playground.innerHTML="";
    gameText.style.display = "none";
    init();
})