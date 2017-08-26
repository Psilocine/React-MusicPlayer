import React from 'react';
import ListItem from '../components/listitem';
import { Link } from 'react-router';

let List = React.createClass({
  render() {
    let listEle = null;
    listEle = this.props.musicList.map((item) => {
      return (
        <ListItem 
          focus={item == this.props.currentMusicItem}
          musicItem={item}
          key={item.id}
        >
        {item.title}
        </ListItem>
        );
    });
    return (
      <div>
      <ul>
        {listEle}
      </ul>
      <Link to='/'> <div className='return-main'>返回</div></Link>
      </div>
    );
  }
})

export default List;