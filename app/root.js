import React from 'react';
import Header from './components/header';
import Player from './page/player';
import List from './page/list'
import { MUSIC_LIST } from './config/musiclist'
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';
import Pubsub from 'pubsub-js';


let App = React.createClass({
  getInitialState() {
    return {
      musicList: MUSIC_LIST,
      currentMusicItem: MUSIC_LIST[0],
      repeatType: 'cycle'
    }
  },
  
  playMusic(musicItem) {
    $('#player').jPlayer('setMedia', {
      mp3: musicItem.file
    }).jPlayer('play');
    this.setState({
      currentMusicItem: musicItem
    });
  },
  playNext(type = 'next') {
    let index = this.findMusicIndex(this.state.currentMusicItem);
    let musicListLength = this.state.musicList.length;
    let newIndex = null;
    if(type === 'next') {
      newIndex = (index + 1) % musicListLength;
    } else {
      newIndex = (index - 1 + musicListLength) % musicListLength;
    }
    this.playMusic(this.state.musicList[newIndex]);
  },
  findMusicIndex(musicItem) {
    return this.state.musicList.indexOf(musicItem);
  },
  componentDidMount() {
    $('#player').jPlayer({
      supplied: 'mp3',
      wmode: 'window'
    });
    this.playMusic(this.state.currentMusicItem);
    $('#player').bind($.jPlayer.event.ended, (e) => {
      this.playWhenEnd();
    });
    Pubsub.subscribe('DELETE_MUSIC', (msg, musicItem) => {
      this.setState({
        musicList: this.state.musicList.filter(item => {
          return item !== musicItem;
        })
      });
      if(this.state.currentMusicItem === musicItem) {
        this.playNext();
      }
    });
    Pubsub.subscribe('PLAY_MUSIC', (msg, musicItem) => {
      this.playMusic(musicItem);
    });
    Pubsub.subscribe('PLAY_PREV', (msg, musicItem) => {
      this.playNext('prev');
    });
    Pubsub.subscribe('PLAY_NEXT', (msg, musicItem) => {
      this.playNext();
    });
    let repeatList = [
      'once',
      'cycle',
      'random'
    ]
    Pubsub.subscribe('CHANGE_REPEAT', (msg) => {
			let index = repeatList.indexOf(this.state.repeatType);
			index = (index + 1) % repeatList.length;
			this.setState({
				repeatType: repeatList[index]
			});
    });
  },
  randomRange(under, over) {
    return Math.ceil(Math.random() * (over - under) + under);
  },
  playWhenEnd () {
    if (this.state.repeatType === 'random') {
			let index = this.findMusicIndex(this.state.currentMusicItem);
			let randomIndex = this.randomRange(0, this.state.musicList.length - 1);
			while(randomIndex === index) {
				randomIndex = this.randomRange(0, this.state.musicList.length - 1);
			}
      this.playMusic(this.state.musicList[randomIndex]);
		} else if (this.state.repeatType === 'once') {
      console.log(this.state.currentMusicItem);
			this.playMusic(this.state.currentMusicItem);
		} else {
			this.playNext();
		}
  },
  componentWillUnmount() {
    Pubsub.unsubscribe('DELETE_MUSIC');
    Pubsub.unsubscribe('PLAY_MUSIC');
    Pubsub.unsubscribe('PLAY_PREV');
    Pubsub.unsubscribe('PLAY_NEXT');
    Pubsub.unsubscribe('CHANGE_REPEAT');
    $('#player').unbind($.jPlayer.event.ended);
  },
  render() {
    return (
      <div>
        <Header />
        {React.cloneElement(this.props.children, this.state)}
      </div>
    );
  }
});

let Root = React.createClass({
  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={App}>
          <IndexRoute component={Player}></IndexRoute>
          <Route path='/list' component={List}></Route>
        </Route>
      </Router>
    );
  }
});

export default Root;