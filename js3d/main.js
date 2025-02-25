// Ссылка на элемент веб страницы в котором будет отображаться графика
var container;
// Переменные "камера", "сцена" и "отрисовщик"
var camera, scene, renderer;

 var N = 256;

// Функция инициализации камеры, отрисовщика, объектов сцены и т.д.
init();
// Обновление данных по таймеру браузера
animate();


// В этой функции можно добавлять объекты и выполнять их первичную настройку
function init()
{
 // Получение ссылки на элемент html страницы
 container = document.getElementById( 'container' );
 // Создание "сцены"
 scene = new THREE.Scene();
 
 camera = new THREE.PerspectiveCamera(
 45, window.innerWidth / window.innerHeight, 1, 2000 );
 // Установка позиции камеры
 camera.position.set(N/2, N, N*2);

 // Установка точки, на которую камера будет смотреть
 camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));
 // Создание отрисовщика
 renderer = new THREE.WebGLRenderer( { antialias: false } );
 renderer.setSize( window.innerWidth, window.innerHeight );
 // Закрашивание экрана синим цветом, заданным в 16ричной системе
 renderer.setClearColor( 0x000000ff, 1);
 container.appendChild( renderer.domElement );
 // Добавление функции обработки события изменения размеров окна
 window.addEventListener( 'resize', onWindowResize, false );
 var canvas = document.createElement('canvas');
 var context = canvas.getContext('2d');
 var img = new Image();
 img.onload = function()
 {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0 );
    imagedata = context.getImageData(0, 0, img.width, img.height);
    
    // Пользовательская функция генерации ландшафта
    CreateTerrain();
    }
    // Загрузка изображения с картой высот
    img.src = 'img/plateau.jpg';
    
}

function onWindowResize()
{
    // Изменение соотношения сторон для виртуальной камеры
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Изменение соотношения сторон рендера
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// В этой функции можно изменять параметры объектов и обрабатывать действия пользователя
function animate()
{
    // Добавление функции на вызов, при перерисовки браузером страницы
    requestAnimationFrame( animate );
    render();
}
function render()
{
    // Рисование кадра
    renderer.render( scene, camera );
}
function getPixel( imagedata, x, y )
{
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return data[ position ];;
}
function CreateTerrain()
{

    var vertices = []; // Объявление массива для хранения вершин
    var faces = []; // Объявление массива для хранения индексов
    var geometry = new THREE.BufferGeometry();// Создание структуры для хранения геометрии

    for (var x = 0; x < N; x++)
    for (var y = 0; y < N; y++)
            vertices.push(x,getPixel(imagedata,x,y)/3,y)
        
    for (var x = 0; x < N-1; x++)
    for (var y = 0; y < N-1; y++)
    {
        var ind1 = x + y * N ;
        var ind2 = (x + 1) + y * N;
        var ind3 = x + (y + 1) * N ;
        var ind4 = (x + 1) + (y + 1) * N;

        faces.push(ind1, ind2, ind4)
        faces.push(ind1, ind4, ind3)
    }
        //Добавление вершин и индексов в геометрию
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setIndex( faces );

        var uvs = []; // Массив для хранения текстурных координат
        for (var x = 0; x < N; x++) {
            for (var y = 0; y < N; y++) {
                uvs.push(x / (N - 1), y / (N - 1)); 
            }
        }
        //Добавление текстурных координат в геометрию
        geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

        var tex = new THREE.TextureLoader().load('img/grasstile.jpg');

        var mat = new THREE.MeshLambertMaterial({
        // Источник цвета - текстура
        map: tex,
        wireframe: false,
        side: THREE.DoubleSide
   });
   
   var triangleMesh = new THREE.Mesh(geometry, mat);

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    //создание точечного источника освещения заданного цвета
    var spotlight = new THREE.PointLight(0xffffff);
    //установка позиции источника освещения
    spotlight.position.set(100, 100, 100);
    //добавление источника в сцену
    scene.add(spotlight);

    // Добавление объекта в сцену
    scene.add(triangleMesh);
}