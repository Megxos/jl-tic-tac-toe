(function(){
    /////////////////////////////////////////////////
    const url = window.location.origin + "/game";
    let socket = io.connect(url);
    let socket2 = io("/view")
    myTurn = null

    function getBoardState() {
        var obj = {};

        /* We are creating an object where each attribute corresponds
         to the name of a cell (r0c0, r0c1, ..., r2c2) and its value is
         'X', 'O' or '' (empty).
        */
        $(".board button").each(function () {
            obj[$(this).attr("id")] = $(this).text() || "";
        });

        return obj;
    }

    function isGameOver() {
        var state = getBoardState();
        var matches = ["XXX", "OOO"]; 

        // We are creating a string for each possible winning combination of the cells
        var rows = [
            state.r0c0 + state.r0c1 + state.r0c2, // 1st line
            state.r1c0 + state.r1c1 + state.r1c2, // 2nd line
            state.r2c0 + state.r2c1 + state.r2c2, // 3rd line
            state.r0c0 + state.r1c0 + state.r2c0, // 1st column
            state.r0c1 + state.r1c1 + state.r2c1, // 2nd column
            state.r0c2 + state.r1c2 + state.r2c2, // 3rd column
            state.r0c0 + state.r1c1 + state.r2c2, // Primary diagonal
            state.r0c2 + state.r1c1 + state.r2c0 // Secondary diagonal
        ];

        // Loop through all the rows looking for a match
        for (var i = 0; i < rows.length; i++) {
            if (rows[i] === matches[0] || rows[i] === matches[1]) {
                return true;
            }
        }

        return false;
    }

    function renderTurnMessage() {
        if (!myTurn) { // If not player's turn disable the board
            // $("#message").text("Your opponent's turn");
            $(".board button").attr("disabled", true);
        } else { // Enable it otherwise
            $("#message").text("Your turn");
            $(".board button").removeAttr("disabled");
            const newMove = Number($("#moves").text()) + 1;
            console.log("newMove:", newMove);
            $(".moves #moves").text(newMove);
        }
    }

    // Bind event on players move
    socket.on("move.made", function (data) {
        $("#" + data.position).text(data.symbol); // Render move

        if (!isGameOver()) { // If game isn't over show who's turn is this
            renderTurnMessage();
        }
    });


    // Bind event for game begin
    socket.on("game.begin", function (data) {
        symbol = data.symbol; // The server is assigning the symbol
        myTurn = symbol === "X"; // 'X' starts first
        // console.log(data);
        // window.localStorage.setItem("usernameX",data.username1);
        // window.localStorage.setItem("usernameO",data.username2);
        renderTurnMessage();
    });

    // Bind on event for opponent leaving the game
    socket.on("opponent.left", function () {
        // $("#message").text("Your opponent left the game.");
        // alert("Opponent Left The Game!")
        $(".board button").attr("disabled", true);
    });

    //sounds
    //theme sound
    var sound = new Howl({
      src: ["/theme_01.mp3"],
      autoplay: 1,
      loop: true
    });
    sound.play();
    var isPlaying = 1;
    $("#toggle_sound").on("click", ()=>{
        if(isPlaying == 1){
            isPlaying = 0;
            sound.stop();
            $("#toggle_sound").text("unmute");
            $("#toggle_sound").removeClass("btn-danger");
            $("#toggle_sound").addClass("btn-success");
        }else{
            isPlaying = 1;
            sound.play();
            $("#toggle_sound").text("mute");
            $("#toggle_sound").removeClass("btn-success");
            $("#toggle_sound").addClass("btn-danger");
        }
    });
    //click sound
    var clicked = new Howl({
      src: [
        "/eatpellet.ogg",
      ],
    });
    
    // $("button").on("click", ()=>{
    //     clicked.play();
    // });
    $("#username").text(window.localStorage.getItem("usernameX"));

     //communication events
     $("#happy").on("click", () => {
         socket2.emit("reaction", {
             reaction: "😀",
             from: "Spectator"
         });
     });
     socket.on("reaction", (data) => {
         $(".output").append(`<p><strong>${data.from}: </strong>${data.reaction}`);
     });
     //eyes reaction
     $("#eyes").on("click", () => {
         socket2.emit("reaction", {
             reaction: "👀",
             from: "Spectator"
         });
     });

     //love reaction
     $("#love").on("click", () => {
         socket2.emit("reaction", {
             reaction: "💓",
             from: "Spectator"
         });
     });
     //clap reaction
     $("#clap").on("click", () => {
         socket2.emit("reaction", {
             reaction: "👏",
             from: "Spectator"
         });
     });

     //send a message
     $("#send").on("click", () => {
         var msg = $("#chat-message").val();
         socket2.emit("message", {
             message: msg,
             from: "Spectator"
         });
         $("#chat-message").val(" ")
     });

     socket.on("message", (data) => {
         $(".output").append(`<p><strong>${data.from}: </strong>${data.message}</p>`);
     });
      //leaderboard
      $(".trigger").on("click", () => {
          $(".list #leads").empty();
          if ($(".leader-board .loader").hasClass("spinner-border")) {
              $(".leader-board .loader").removeClass("spinner-border")
          } else {
              $(".leader-board .loader").addClass("spinner-border")
          }
          $(".leader-board").toggleClass("open");
          socket2.emit("getLeaderBoard", "leaderboard");
      });
      socket.on("getLeaderBoard", async (data) => {
          var leaders = [];
          var bar = 0;
          var size = 0;
          await data.forEach(user => {
              if (bar <= user.wins) {
                  leaders.push(user);
                  bar = user.wins;
                  size += 1;
              };
          });
          for (var i = size - 1; i >= 0; i--) {
              if ($(".leader-board").hasClass("open")) {
                  $(".list #leads").append(`<li style="position: relative;"><strong>${leaders[i].username}</strong> - ${leaders[i].wins}</li>`)
              };
          }
      });
})();