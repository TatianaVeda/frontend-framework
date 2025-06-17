// // framework/index.js
// export * from 'framework/state';   
// export * from 'framework/dom';
// export * from 'framework/events';
// export * from 'framework/router';
// export * from 'framework/performance';
// export * from 'framework/components';
// export * from 'framework/api';
// export * from 'framework/logger.js';
// export * from 'framework/config.js';

// Чтобы использовать файл **index.js** в качестве центрального модуля экспорта, нужно изменить способ импорта модулей в демонстрационном проекте и, возможно, настроить alias в конфигурации проекта (например, в importmap и jsconfig.json). Вот шаги, которые помогут это сделать:

// 1. **Измените импорты в коде:**  
//    Вместо того чтобы импортировать каждый модуль напрямую, например:

//    ```js
//    import { Router, registerRoute, registerNotFound, navigateTo } from 'framework/router.js';
//    import { initPersistentState } from 'framework/persistentState.js';
//    import { renderComponent, defineComponent, bindComponentToStateWithDeps } from 'framework/components.js';
//    ```

//    Измените их на импорт из главного файла фреймворка:

//    ```js
//    import { Router, registerRoute, registerNotFound, navigateTo, initPersistentState, renderComponent, defineComponent, bindComponentToStateWithDeps } from 'framework';
//    ```

//    Это позволит использовать все экспорты из **index.js**.

// 2. **Настройте importmap (если используется):**  
//    В файле **index.html** у вас сейчас может быть что-то вроде:

//    ```json
//    {
//      "imports": {
//        "framework/": "../framework/",
//        "example/": "./"
//      }
//    }
//    ```

//    Чтобы импортировать из **index.js**, можно добавить или изменить маппинг так, чтобы ключ `"framework"` указывал на нужный файл. Например:

//    ```json
//    {
//      "imports": {
//        "framework": "../framework/index.js",
//        "framework/": "../framework/",
//        "example/": "./"
//      }
//    }
//    ```

//    Таким образом, при импорте `from 'framework'` будет использоваться файл **index.js**.

// 3. **Обновите jsconfig.json (при необходимости):**  
//    Если вы используете **jsconfig.json** для алиасов, убедитесь, что путь для модуля `framework` настроен на файл index.js. Пример:

//    ```json
//    {
//      "compilerOptions": {
//        "baseUrl": ".",
//        "paths": {
//          "framework": ["framework/index.js"],
//          "framework/*": ["framework/*"],
//          "example/*": ["example/*"]
//        }
//      },
//      "include": ["framework", "example"]
//    }
//    ```

// Эти изменения заставят демонстрационный проект использовать **index.js** как точку входа для всех модулей фреймворка, что упрощает импорты и позволяет при необходимости изменить внутреннюю организацию без правок во всех файлах проекта.