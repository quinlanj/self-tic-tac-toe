import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';

import { DangerZone } from 'expo';
const { Lottie } = DangerZone;

const GRID_LEN = 60;
const WIDTH = 3;
const HEIGHT = 3;
const EMPTY = 0;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.reset();

  }

  reset (){
    return {
      currPlayer: 1,
      animation: null,
      board: this.initBoard(),
    };
  }

  initBoard(){
    var board = [];
    for (var i = 0; i <WIDTH; i++){
      var row = [];
      board.push(row);
      for (var j = 0; j < HEIGHT; j++){
        row.push(EMPTY);
      }
    }
    return board;
  }

  componentWillMount() {
    //this._playAnimation();
  }

  nextTurn(coords){
    let x = coords[0];
    let y = coords[1];
    if (!this.canMove(x, y)){
      return;
    }
    var board = this.state.board;
    board[coords[0]][coords[1]] = this.state.currPlayer;
    this.setState({
      currPlayer: this.state.currPlayer === 1 ? 2 : 1,
      board,
    });

    let winner = this.whoWon();
    if (winner !== undefined) {
      alert("Player "+ winner+" won!");
      this.setState(this.reset());
    } else if (this.isDraw()){
      alert("Quin won!");
      this.setState(this.reset());
    }
  }

  isDraw(){
    for (var i = 0; i < WIDTH; i++){
      for (var j = 0; j < HEIGHT; j++){
        if (this.state.board[i][j]===EMPTY){
          return false;
        }
      }
    }
    return true;
  }

  whoWon(){
    var winner = undefined;
    winner = this.hasWonStraight(true);
    if (winner !== undefined){
      //alert("has won straight  horiz " + winner);
      return winner;
    }

    winner = this.hasWonStraight(false);
    if (winner !== undefined){
      //alert("has won straight  vert " + winner);
      return winner;
    }

    winner = this.hasWonDiag(true);
    if (winner !== undefined){
      //alert("has won straight  neg diag " + winner);
      return winner;
    }

    winner = this.hasWonDiag(false);
    if (winner !== undefined){
      //alert("has won straight  pos diag " + winner);
      return winner;
    }

    return winner;
  }

  hasWonStraight(isHoriz){
    var I_MAX, J_MAX;
    if (isHoriz){
      I_MAX = HEIGHT;
      J_MAX = WIDTH;
    } else {
      I_MAX = WIDTH;
      J_MAX = HEIGHT;
    }
    for (var i = 0; i< I_MAX; i++){
      var winner = undefined;
      for (var j = 0; j< J_MAX; j++){
        var currSpace = isHoriz? this.state.board[i][j] : this.state.board[j][i];
        if (currSpace === EMPTY){
          winner = undefined;
          break; // empty slot, no winner
        } else {
          if (winner === undefined){
            winner = currSpace;
          } else if (winner !== currSpace){
            winner = undefined;
            break; // more than two players in a line, no winner
          }
        }
      }
      if (winner !== undefined){
        return winner;
      }
    }
    return undefined;
  }

  hasWonDiag(isNegSlope){
    var winner = undefined;
    for (var i = 0; i < WIDTH; i++){
      var j = isNegSlope? i : WIDTH - 1 - i;
      if (this.state.board[i][j] === EMPTY){
        winner = undefined;
        break; // empty slot, no winner
      } else {
        if (winner === undefined){
          winner = this.state.board[i][j];
        } else if (winner !== this.state.board[i][j]){
          winner = undefined;
          break; // more than two players in a line, no winner
        }
      }
    }
    return winner;
  }

  canMove(x, y){
    return this.state.board[x][y] === 0;
  }

  _onPressButton(coords){
    return ()=>{
      this.nextTurn(coords);
    };
  }

  _playAnimation = () => {
    if (!this.state.animation) {
      this._loadAnimationAsync();
    } else {
      this.animation.reset();
      this.animation.play();
    }
  };

  _loadAnimationAsync = async () => {
    let result = await fetch(
      'https://cdn.rawgit.com/airbnb/lottie-react-native/635163550b9689529bfffb77e489e4174516f1c0/example/animations/Watermelon.json'
    );

    this.setState(
      { animation: JSON.parse(result._bodyText) },
      this._playAnimation
    );
  };

  playedGrid (currPlayer) {
    let color = currPlayer ===  1? 'black' : 'purple';
    //alert(currPlayer + " " + color);
    return <View style={{width: GRID_LEN, height: GRID_LEN, backgroundColor: color}} />
  }

  renderCell(x, y){
    return (
    <TouchableOpacity key = {[x,y]} onPress={this._onPressButton([x,y])}>
        <View style={{width: GRID_LEN, height: GRID_LEN, backgroundColor: 'powderblue'}}>
          {this.state.board[x][y] !== EMPTY && this.playedGrid(this.state.board[x][y])}
        </View >
    </TouchableOpacity>
    );
  }

  renderColumn(colNum, row_len){
    var pillar = []
    for (var i = 0; i<row_len; i++){
      pillar.push(this.renderCell(i, colNum));
    }
    return (
          <View key = {colNum} style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
          }}>
          {pillar.map((cell)=>cell)}
          </View>
    );
  }

  renderGrid(num_cols, num_rows){
    var row = [];
    for (var i=0; i< num_cols; i++){
      row.push(this.renderColumn(i, num_rows));
    }
    return row;
  }

  render() {
    return (
      <View style={{
            flex: 1,
            flexDirection: 'column',
      }}>
        <View style={{
            flex: 0.8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {this.renderGrid(WIDTH, HEIGHT).map((pillar)=>pillar)}
        </View>
        <View style={{
          flex: 0.2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text>Your Move, Player #{this.state.currPlayer}</Text>
        </View>
      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
