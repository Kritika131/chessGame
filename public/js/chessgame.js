
const socket = io();


const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;


const renderBoard = () => {  
    const board = chess.board();
    // console.log("board---",board)
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((piece, pieceIndex) => {
            const square = document.createElement("div");
            square.classList.add("square",
                (rowIndex + pieceIndex) % 2 === 0 ? "light" : "dark"
            );
          
            square.dataset.row = rowIndex;
            square.dataset.col = pieceIndex;
            if(piece){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", piece.color=="w"?"white":"black");
            
            pieceElement.innerText = getPieceUnicode(piece);
            pieceElement.draggable = playerRole === piece.color;
            pieceElement.addEventListener("dragstart", (e)=>{

                if(pieceElement.draggable){
                    draggedPiece = pieceElement;
                    sourceSquare = {row: rowIndex, col: pieceIndex};
                    e.dataTransfer.setData("text/plain", "");
                }
            });
            pieceElement.addEventListener("dragend", (e)=>{
                draggedPiece = null;
                sourceSquare = null;
            });
            
            square.appendChild(pieceElement);
        }

        square.addEventListener("dragover", (e)=>{
            e.preventDefault();
        });
        square.addEventListener("drop", (e)=>{
            e.preventDefault()
            if(!draggedPiece){
                return;
            }
            const targetSource = {row: parseInt(square.dataset.row), col: parseInt(square.dataset.col)};
            handleMove(sourceSquare, targetSource);
        });
        boardElement.appendChild(square);
    })
    });
    if(playerRole==="b"){
        boardElement.classList.add("flipped");

    } else{
        boardElement.classList.remove("flipped");
    }

 };

 
 const handleMove = (source,target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:"q",
    }

    socket.emit("move",move);
 }

 const getPieceUnicode=(piece)=>{
    //  console.log("piece---",piece)
    const unicodeMap = {
        p: "♙", r: "♜", n: "♞", b: "♝", q:"♛", k: "♚",
            P: "♙", R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
        };
        return unicodeMap[piece.type] || "";
    }
    socket.on("playerRole",(role)=>{
        playerRole = role;
        renderBoard();
    });

    socket.on('spectatorRole',()=>{
        playerRole = null;
        renderBoard();
    });

    socket.on("boardState",(fen)=>{
        chess.load(fen)
        renderBoard()
    })

    socket.on("move",(move)=>{
        chess.move(move)
        renderBoard()
    })
    
    renderBoard()
