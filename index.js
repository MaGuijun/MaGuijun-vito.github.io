// 公共的方法
// 设置样式
function setStyle(d, styleObject) {
  for (const key in styleObject) {
    d["style"][key] = styleObject[key];
  }
  d["style"]["transition"] = ".225s";
}

// 生成随机的坐标
function randomPosition(min, max) {
  return randomKey(min, max);
}

// 生成随机的数字 (min,max)
function randomKey(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min);
}

// 打乱数组
function randomSort(a, b) {
  return Math.random() > 0.5 ? -1 : 1;
}

// 获取dom元素
const app = document.querySelector("#app");
// 设置图片的大小
const $width = 50;
const $height = 50;
// 多少组 3 的倍数
const BlockNums = 3;
// 存放所有的Block块
const allBlock = [];
// 图片的地址
const IMGS = [
  "./img/1.jpg",
  "./img/2.jpg",
  "./img/3.jpg",
  "./img/4.jpg",
  "./img/5.jpg",
  "./img/6.jpg",
  "./img/7.jpg",
];
// 游戏是否结束
let gameOver = false;
// 计算渲染区域的位置
function calPosition() {
  // 获取app的位置信息
  const { x, y } = app.getBoundingClientRect();
  // console.log(appPos);
  const AppPosition = {
    x,
    y,
    drawStartX: 20,
    drawStartY: 20,
    drawEndX: app.offsetWidth - 70,
    drawEndY: app.offsetHeight - 200,
  };
  return AppPosition;
}
const AppPosition = calPosition();
// 定义收集盒的数组
const hasBlockArr = [];
// 获取收集盒的位置信息
var storageBoxPostion;
// 获取收集盒中存放第一张图片的位置
var startLeft;

// 将块放入到收集盒中
function computedBoxPosition(target, targetDomClass) {
  // console.log(target);
  // console.log(targetDomClass);
  // 当前元素设置在最顶层
  setStyle(target, {
    zIndex: 9999,
  });
  const Item = { target, targetDomClass };
  storageBoxPostion = storageBox.getBoundingClientRect();
  startLeft = storageBoxPostion.x - AppPosition.x + 10;
  const top = storageBoxPostion.y - AppPosition.y + 10 + "px";
  if (!hasBlockArr.length) {
    setStyle(target, {
      left: startLeft + "px",
      top,
    });
    targetDomClass.left = startLeft;
    hasBlockArr.push(Item);
  } else {
    // 查找是否有相同的元素存在
    const hasIndex = hasBlockArr.findIndex((v) => {
      return v.targetDomClass.n == targetDomClass.n;
    });
    if (hasIndex === -1) {
      //没有相同的元素存在
      const left = startLeft + hasBlockArr.length * targetDomClass.width;
      setStyle(target, {
        left: left + "px",
        top,
      });
      targetDomClass.left = left;
      hasBlockArr.push(Item);
    } else {
      //有相同的元素
      //  将后面所有的元素包括自身都要后退一个位置
      for (let index = hasBlockArr.length - 1; index >= hasIndex; index--) {
        const newleft = startLeft + (index + 1) * $width;
        setStyle(hasBlockArr[index].target, {
          left: newleft + "px",
        });
        hasBlockArr[index].targetDomClass.left = newleft;
      }
      setStyle(target, {
        left: startLeft + hasIndex * targetDomClass.width + "px",
        top,
      });
      targetDomClass.left = startLeft + hasIndex * targetDomClass.width;
      hasBlockArr.splice(hasIndex, 0, Item);
    }
  }
  Item.target.classList.remove("noSelect"); //没有被选中，删除
  Item.target.classList.add("isSelect"); //添加，表示被选中的
  const removeIndex = allBlock.findIndex((v) => {
    return v.index === Item.targetDomClass.index;
  });
  // 删除allBock中的对应的对象
  allBlock.splice(removeIndex, 1);
  // 暴力高亮，重新渲染
  const noSelect = document.querySelectorAll(".noSelect");
  // 全部删除剩余所有的元素
  for (let i = 0; i < noSelect.length; i++) {
    app.removeChild(noSelect[i]);
  }
  // 重新渲染
  allBlock.forEach((item) => {
    app.appendChild(item.draw());
  });
}
// 验证输赢
function GameState() {
  if (hasBlockArr.length === 7) {
    alert("不好意思，你输了，有点小菜鸡哈，继续加油！！！");
    gameOver = true;
  }
  if (!allBlock.length && !hasBlockArr.length) {
    alert("哇，好厉害，恭喜你赢得胜利！！！");
    gameOver = true;
  }
  // 判断游戏结束
  if (gameOver) {
    window.location.reload(false);
  }
}
// 将相同的元素进行消除
function checkBox() {
  const checkMap = {}; //用来接受收集盒中的相同的图片的数据
  hasBlockArr.forEach((item, index) => {
    if (!checkMap[item.targetDomClass.n]) {
      checkMap[item.targetDomClass.n] = [];
    }
    checkMap[item.targetDomClass.n].push({
      index: index,
      id: item.targetDomClass.index,
    });
    for (const key in checkMap) {
      if (checkMap[key].length === 3) {
        //删除数组中的相同的三个元素
        hasBlockArr.splice(checkMap[key][0].index, 3);
        setTimeout(() => {
          checkMap[key].forEach((item) => {
            var box = document.getElementById(item.id);
            box.parentNode.removeChild(box);
          });
          // 改变页面其他的dom元素的位置
          hasBlockArr.forEach((item, index) => {
            let left = startLeft + index * item.targetDomClass.width + "px";
            setStyle(item.target, {
              left,
            });
            item.targetDomClass.left = left;
          });
        }, 300);
      }
    }
  });
  // 验证状态
  setTimeout(() => {
    GameState();
  }, 500);
}

// 定义点击事件
function clickBlock(target, targetDomClass) {
  if (targetDomClass.blockState) {
    //只有为true，表示未被遮挡，才可以点击
    // 收集元素
    computedBoxPosition(target, targetDomClass);
    // 消除相同的元素
    checkBox();
  }
}
// 定义一个类，类的实例对象上就保存自身的信息
class Block {
  constructor(src, i) {
    this.width = $width;
    this.height = $height;
    this.src = src;
    this.index = i;
    this.n = src;
    this.blockState = false;
    this.x = randomPosition(AppPosition.drawStartX, AppPosition.drawEndX);
    this.y = randomPosition(AppPosition.drawStartY, AppPosition.drawEndY);
  }
  // 判断是否被遮挡
  isCover() {
    var thatBlock; //表示当前的元素
    var coverState = false;
    for (let i = 0; i < allBlock.length; i++) {
      // 找到当前元素
      if (allBlock[i].index === this.index) {
        thatBlock = allBlock[i];
      } else if (thatBlock) {
        // 找到目标元素
        const target = allBlock[i];
        // console.log(thatBlock);
        // console.log(target);
        // 找到目标元素对应的位置
        var xLeft = target.x;
        var xRight = target.x + target.width;
        var yTop = target.y;
        var yBottom = target.y + target.height;
        if (
          !(
            thatBlock.x > xRight ||
            thatBlock.x + thatBlock.width < xLeft ||
            thatBlock.y > yBottom ||
            thatBlock.y + thatBlock.height < yTop
          )
        ) {
          coverState = true;
          break;
        }
      }
    }
    return coverState;
  }
  // 将图片渲染
  draw() {
    const imgDom = new Image();
    imgDom.src = this.src;
    imgDom.id = this.index;
    imgDom.classList = "noSelect imgGlobal";
    imgDom.onclick = clickBlock.bind(null, imgDom, this);
    let style = {
      width: this.width + "px",
      height: this.height + "px",
      left: this.x + "px",
      top: this.y + "px",
    };
    if (this.isCover()) {
      imgDom.classList.add("imgFilter");
      this.blockState = false;
    } else {
      imgDom.classList.remove("imgFilter");
      this.blockState = true;
    }
    setStyle(imgDom, style);
    return imgDom;
  }
}

function drawBlock(gloup) {
  let virtualArr = [];
  for (let i = 0; i < gloup; i++) {
    virtualArr.push(...IMGS.sort(randomSort));
  }
  // console.log(virtualArr);
  virtualArr.forEach((item, index) => {
    const vBlock = new Block(item, index);
    allBlock.push(vBlock);
  });
  console.log(allBlock);
  // 渲染
  allBlock.forEach((item) => {
    app.appendChild(item.draw());
  });
}
// 定义一个数组，用来收集点击的图片
window.onload = () => {
  drawBlock(BlockNums);
  // 给收集盒子定义样式
  setStyle(storageBox, {
    border: "10px solid blue",
  });
};
