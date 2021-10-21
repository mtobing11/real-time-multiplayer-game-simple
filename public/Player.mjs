class Player {
  constructor({x, y, score, id, dimension}) {
    this.x = x; this.y = y; this.score = score; this.id = id; this.rank = 0; this.dimension = dimension;
  }

  movePlayer(dir, speed) {
    switch(dir){
      case 'up':
        this.y = this.y - speed;
        break;
      case 'down':
        this.y = this.y + speed;
        break;
      case 'left':
        this.x = this.x - speed;
        break;
      case 'right':
        this.x = this.x + speed;
        break;
    }
  }

  collision(item) {
    let deltaX = this.x - item.x;
    let deltaY = this.y - item.y;
    
    deltaX < 0 ? deltaX = Math.sqrt(deltaX*deltaX) - this.dimension[0] : deltaX = deltaX - item.dimension[0];
    deltaY < 0 ? deltaY = Math.sqrt(deltaY*deltaY) - this.dimension[1] : deltaY = deltaY - item.dimension[1];
    
    if(deltaX < 0 && deltaY < 0 && item.status){
      this.score = this.score + item.value;
      item.changeStatus();
      return true;
    }
    return false
  }

  calculateRank(arr) {
    arr.map((p,i) => {
      if(p.id == this.id){
        this.rank = i+1
      }
    })
    return `${this.rank}/${arr.length}`
  }
}


export default Player;