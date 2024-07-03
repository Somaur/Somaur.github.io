document.getElementById('confirmButton').addEventListener('click', startComparison);
document.getElementById('modifyButton').addEventListener('click', cancelComparison);
document.getElementById('copyButton').addEventListener('click', function() {
    const textArea = document.getElementById('outputTextview');
    navigator.clipboard.writeText(textArea.value).then(function() {
        console.log('复制成功！');
        showToast('复制成功！');
    }).catch(function(err) {
        console.log('无法复制：', err);
    });
});

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'show';
    setTimeout(function() {
        toast.className = toast.className.replace('show', '');
    }, 3000); // 3秒后隐藏
}

function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

let inputState = true;
let endState = false;
let elements = [];
let sortedElements = [];

/**
 * @type {number}
 */
let n = 0;

/**
 * @type {Set.<number>}
 */
let singleElements = new Set();

/**
 * 最上的元素列表（向下遍历的起点）
 * @type {Set.<number>}
 */
let downStartElements = new Set();

/**
 * 最下的元素列表（向上遍历的起点）
 * @type {Set.<number>}
 */
let upStartElements = new Set();

/**
 * 向上的边
 * @type {Array.<Set.<number>>}
 */
let upEdges = [];

/**
 * 向下的边
 * @type {Array.<Set.<number>>}
 */
let downEdges = [];

/**
 * 在上方能看到的元素
 * @type {Array.<Set.<number>>}
 */
let upVisibles = [];

/**
 * 在下方能看到的元素
 * @type {Array.<Set.<number>>}
 */
let downVisibles = [];

/**
 * 被多少条upEdge连入down
 * @type {Array.<number>}
 */
let upDegree = [];

/**
 * 被多少条downEdge连入
 * @type {Array.<number>}
 */
let downDegree = [];

/**
 * @type {Array.<number>}
 */
let heights = [];

/**
 * @type {Array.<number>}
 */
let depths = [];

/**
 * @type {Array.<number>}
 */
let visited = [];

function initGraph() {
    n = elements.length;
    singleElements = new Set(Array.from({ length: n }, (_, index) => index));
    upStartElements = new Set(Array.from({ length: n }, (_, index) => index));
    downStartElements = new Set(Array.from({ length: n }, (_, index) => index));
    upEdges = Array.from({ length: n }, _ => new Set());
    downEdges = Array.from({ length: n }, _ => new Set());
    upDegree = Array.from({ length: n }, _ => 0);
    downDegree = Array.from({ length: n }, _ => 0);
}

function setPriority(a, b) {
    console.log(`设置优先级 ${elements[a]} -> ${elements[b]}`);
    console.log(`setPriority ${a} -> ${b}`);

    singleElements.delete(a);
    singleElements.delete(b);
    upStartElements.delete(a);
    downStartElements.delete(b);
    downEdges[a].add(b);
    upEdges[b].add(a);
    downDegree[b] += 1;
    upDegree[a] += 1;

    nextComparison();
    updateState();
}

function topologicalScan() {
    let queue = [];
    let stack = [];
    let counter = Array(n).fill(0);
    heights = Array(n).fill(1);
    depths = Array(n).fill(1);
    upVisibles = Array.from({ length: n }, (_, index) => {let e = new Set(); e.add(index); return e;});
    downVisibles = Array.from({ length: n }, (_, index) => {let e = new Set(); e.add(index); return e;});

    downStartElements.forEach(e => queue.push(e));
    while (queue.length) {
        let x = queue.shift();
        downEdges[x].forEach(y => {
            upVisibles[x].forEach(e => upVisibles[y].add(e));
            depths[y] = Math.max(depths[x] + 1, depths[y]);
            counter[y] += 1;
            if (counter[y] === downDegree[y]) {
                queue.push(y);
            }
        });
        stack.push(x);
    }

    while (stack.length) {
        let x = stack.pop();
        upEdges[x].forEach(y => {
            downVisibles[x].forEach(e => downVisibles[y].add(e));
            heights[y] = Math.max(heights[x] + 1, heights[y]);
        });
    }
}

let stackin = [];
function checkCircle(x) {
    if (visited[x]) return
    visited[x] = true;
    stackin[x] = true;

    downEdges[x].forEach(y => {
        if (stackin[y]) {
            console.error(`[!] There is a Circle in ${x} - ${y}`)
            endState = true
        }
        checkCircle(y);
    });
    stackin[x] = false;
}

let logs = [];

function updateState() {
    if (inputState) {
        document.getElementById('inputTextview').classList.remove('disabled');
        document.getElementById('progressText').style.display = 'none';
        document.getElementById('questionText').style.display = 'none';
        document.getElementById('endText').style.display = 'none';
        
        document.getElementById('outputTextview').value = "";
    }
    else if (endState) {
        document.getElementById('inputTextview').classList.add('disabled');
        document.getElementById('progressText').style.display = 'none';
        document.getElementById('questionText').style.display = 'none';
        document.getElementById('endText').style.display = 'block';
        
        document.getElementById('outputTextview').value = sortedElements.join('\n');
        console.log(logs);
    }
    else {
        document.getElementById('inputTextview').classList.add('disabled');
        document.getElementById('progressText').style.display = 'block';
        document.getElementById('questionText').style.display = 'block';
        document.getElementById('endText').style.display = 'none';

        let total = n * n - n;
        let done = upVisibles.reduce((sum, e) => sum + e.size, 0) + downVisibles.reduce((sum, e) => sum + e.size, 0) - n - n;

        document.getElementById('progressBar').textContent = `${done} / ${total}`;
        logs.push(done);
    }
}

function startComparison() {
    if (inputState === false) {
        return
    }
    const input = document.getElementById('inputTextview').value;
    if (input.trim() === '') {
        elements = [];
    }
    else {
        elements = input.split('\n').map(e => e.trim());
    }
    initGraph();
    inputState = false;
    endState = false;
    nextComparison();
    updateState();
}

function cancelComparison() {
    if (inputState === true) {
        return
    }
    inputState = true;
    endState = false;
    updateState();
}

function nextComparison() {
    if (downStartElements.size === 0) {
        endState = true;
        document.getElementById('outputTextview').value = "输入0个元素";
        return
    }

    topologicalScan();

    stackin = Array(n).fill(false);
    visited = Array(n).fill(false);
    downStartElements.forEach(e => {
        checkCircle(e);
    });

    if (downStartElements.size === 1 && heights[downStartElements.keys().next().value] === n) {
        endState = true;
        // 迭代完成，输出答案
        sortedElements = Array.from({ length: n }, (_, index) => index).map(
            i => {
                let j = 0;
                heights.forEach((h, idx) => {
                    if (h === n - i) j = idx
                });
                return elements[j];
            }
        );
        return
    }

    let aa = Array.from({ length: n }, (_, index) => index).filter(
        i => upVisibles[i].size + downVisibles[i].size <= n
    )
    if (aa.length === 0) {
        console.error("Unknow error: no A found");
        return;
    }
    let a = getRandomElement(aa)
    let bb = Array.from({ length: n }, (_, index) => index).filter(
        i => !(upVisibles[a].has(i)) && !(downVisibles[a].has(i))
    )
    let bWithWeight = bb.map(i => [i, Math.min(Math.abs(heights[a] - heights[i]), Math.abs(depths[a] - depths[i]))]);
    let bWithWeight5 = bWithWeight.sort((a, b) => a[1] - b[1]).filter(e => e[1] === bWithWeight[0][1]).map(e => e[0]);
    let b = getRandomElement(bWithWeight5)
    // let b = getRandomElement(bb)

    askQuestion(a, b)
}

function askQuestion(AId, BId) {
    document.getElementById('question').textContent = `${elements[AId]} 和 ${elements[BId]} 哪个更优先？`;
    const optionA = document.getElementById('optionA');
    const optionB = document.getElementById('optionB');
    optionA.textContent = elements[AId];
    optionB.textContent = elements[BId];
    optionA.onclick = () => setPriority(AId, BId);
    optionB.onclick = () => setPriority(BId, AId);
}

/*

改进计划

- 在询问时更倾向询问深度接近的元素对，更有可能伸长链条
  - “深度接近”：从两端计算有一端接近即可
  - 在前期是负优化，因为随机取点有可能将点连到链的中间，这种策略就不行
  - 考虑修改为仅末期执行

x 在抽取as时更倾向抽取游离的单个元素
  - 负优化
  - 会导致首/尾元素增多

- 在抽取bs时更倾向抽取其他联通块的元素

- 更倾向抽取首/尾元素，把首位收束起来

*/