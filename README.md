How to create React App and embed it with CEWP webpart (with properties)

GitHub

Everyone who used SharePoint Framework should know that is quite a neat tech. New Microsoft policy to move SharePoint out to the cloud has demanded to move all development into front end. It means that any custom solutions based on .Net code had to be replaced with its JavaScript equivalent. That was quite a tough information for all SharePoint developers, as it required from them, putting tremendous effort into changing their development stack. Despite that, I believe that was a smart move from Microsoft.
There’s only one but… it takes time to build new framework, I must evolve to become perfect. Unfortunately, SharePoint 2016 on-premises has became a big victim of that change. It may feel it’s a SharePoint 2013 with worn mask, which is supposed to make you think it works in modern experience. I’ve had opportunity to build SPFX for SharePoint 2016, but stumbled across one problem that couldn’t just be omitted or passed by, especially from CI point of view that was no-no way to go. SharePoint 2016 just isn’t able to add SPFX app to the web from PowerShell or .net. Installing SPFX on a web  - crearly states “Only SharePoint 2019 or online is capable of doing it”. That’s most unfortunate, which makes a lot of project architectures to crack against SPFX. That’s not the end, as SPFX Extension are not included to SharePoint 2016 at all! There’s no solution template which may be deployed to the farm.
In that case we needed something else. I didn’t want to go back to good old JavaScript development, as being familiar with React framework and typescript I wanted to take advantage of that and build solution with tech we already knew. I decided to give a try and build my own approach for front end development leveraging single–page React application, and fitting it into SharePoint 2016.
I needed to build base for the template. At first, my goal was to create a project that will comply with just two requirements. It must be TypeScript project (no old SharePoint projects from VS!) and it also must allow me to load SCSS classes as modules into React components. I really like that SPFX supports it and that would be a real shame to lose it. That wasn’t much, but for my small project it was all I needed.
I started from calling npx create-react-app my-app --scripts-version=react-scripts-ts to have a base. Easy enough! Now, it was time to apply SCSS module support. Unfortunately, webpack configuration is sewed into react-scripts-ts module by default, with purpose to simplify builds. Therefore applying scss-loader isn’t that simple at first look. After browsing numerous possibilities I’ve finally found the resolution. It is required to eject webpack configuration from react-scrips-ts, so I did call npm run eject. This action is irreversible and made my package swell due to moving all package definitions from react-scripts-ts package.json file to my project. Only then I could apply scss-loader to my configuration.
I needed to get some more packages too. I’ve installed following: sass-loader, node-sass, typeings-for-scss-modules-loader.

--------------------------------------------------------------------------------------
npm I sass-loader node-sass typings-for-scss-modules-loader
--------------------------------------------------------------------------------------

Then, I needed to associate files *.scss with sass-loader and typings-for-scss-modules-loader. In order to do that, I’ve modified module configuration for both CSS and SCSS file extensions. The outcome is following:

--------------------------------------------------------------------------------------
          {
            test: /\.css$/,
            use:
              [
                { loader: 'style-loader' },
                {
                  loader: 'typings-for-scss-modules-loader?modules',
                },
                'postcss-loader'
              ]
            //})
          },
          {
            test: /\.scss$/,
            use:
              [{ loader: 'style-loader' },
              {
                loader: 'typings-for-scss-modules-loader?modules&sass',
              },
                'sass-loader'
              ]
            //})
          },
--------------------------------------------------------------------------------------

Secondly, I’ve excluded SCSS files from being processed by file-loader, as they might get processed by other loaders. That configuration gave me similar SCSS handling as SPFX. That’s a great separation of SCSS and Typescript code to different files, otherwise I guess I would need to use React styled components and mess both codes types in one file and I really didn’t feel like to!
Now, as I’ve completed my configuration goal, I needed to focus how I should apply the project to become a WebPart. By default, main script is attached to an index.html file that’s built from a template file residing in /public folder. I needed to get separate HTML file for production builds, as SharePoint wouldn’t be happy if I pushed him whole HTML Page. To achieve this task I had to define some variables which I could use during build process. In the path.js file under /config folder, I’ve added export variables named webPartFolderName and webPartRelativePath. Next, I’ve created IndexSP.html file and filled it with following structure:

--------------------------------------------------------------------------------------
<div id=<%= JSON.stringify(htmlWebpackPlugin.options.webPartFolderName) %>></div>
--------------------------------------------------------------------------------------

Then,I’ve changed appHtml variable in path.js (/config) so webPartFolderName is assigned to IndexSP.html for production builds and index.html for testing and debuging.

--------------------------------------------------------------------------------------
const appHtml = (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'test') ? resolveApp('public/index.html') : resolveApp('public/indexSP.html')
--------------------------------------------------------------------------------------

Lastly I’ve updated negativeFallback property in webpack.config.prod to also use IndexSP.html. The build HTML result started to looks like that:

--------------------------------------------------------------------------------------
 <div id="myspapp"></div>
<script type="text/javascript" src="/_catalogs/masterpage/WebParts/myspapp/script.js">
</script>
--------------------------------------------------------------------------------------

This was great, I have now output HTML file which content that can be used in ContentEditorWebPart to import scripts. I only needed an easy way to apply it to SP Web. So, I’ve created contentEditorWebpart.dwp template file in root folder of my project, which I could upload to SharePoint WebPart gallery. SharePoint will discover a totally new WebPart that way. But that wasn’t enough for me. It didn’t satisfy me enough as I wasn’t able to figure out how to apply custom properties for each WebPart separetly. (Any changes to HTML files would result with change for all WebPart instances). 
So I kept thinking how to solve my problem. Solution I came up with, is pretty simple. Use ScriptWebpart instead and add properties to script. To do that I’ve created WebPartDefinition.webpart template which looks like that:

--------------------------------------------------------------------------------------
 <?xml version="1.0" encoding="utf-8"?>
<webParts>
    <webPart xmlns="http://schemas.microsoft.com/WebPart/v3">
        <metaData>
            <type name=
"Microsoft.SharePoint.WebPartPages.ScriptEditorWebPart, Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />
            <importErrorMessage>$Resources:core,ImportErrorMessage;</importErrorMessage>
        </metaData>
        <data>
            <properties>
                <property name="Title" type="string">{FolderNameTemplate}</property>
                <property name="Description" type="string"></property>
                <property name="ChromeType" type="chrometype">None</property>
                <property name="Content" type="string">{ScriptInject}</property>
            </properties>
        </data>
    </webPart>
</webParts>
--------------------------------------------------------------------------------------

You may notice that I’ve added dynamic content ({FolderNameTemplate} {ScriptInject }) that would be replaced upon the builds.
Then, I’ve created a PowerShell script build.ps1 which replaced dynamic content with HTML encoded of index.html content to Content property and Title property with solution name. I encourage you to check build.ps1 script itself on GitHub. The outcome looks like that:
 
 --------------------------------------------------------------------------------------
<properties>
    <property name="Title" type="string">myspapp</property>
    <property name="Description" type="string"></property>
    <property name="ChromeType" type="chrometype">None</property>
    <property name="Content" type="string">&lt;div id=&quot;myspapp&quot;&gt;&lt;/div&gt;&lt;script type=&quot;text/javascript&quot; src=&quot;/_catalogs/masterpage/WebParts/myspapp/script.js&quot; title=&quot;My First Script editor webpart!&quot; description=&quot;Script editor webpart with React App, who would have thought!&quot;&gt;&lt;/script&gt;</property>
</properties>
--------------------------------------------------------------------------------------

Now it’s time to apply properties to the WebPart. To do that I needed an instance of properties, so I’ve created webpartProperties.json just under /src for an easy access and convenience.

--------------------------------------------------------------------------------------
 {
    "title": "My First Script editor webpart!",
    "description": "Script editor webpart with React App, who would have thought!"
}
--------------------------------------------------------------------------------------

I wanted to have a feature which I could feed my WebPart with default values. I had already json object, but I still needed to have them put in WebPart definition. To achieve my goal, I firstly imported webpartProperties.json to path.js under /config with require call. Having that, with help of html-webpack-inject-attributes-plugin

--------------------------------------------------------------------------------------
npm I html-webpack-inject-attributes-plugin
--------------------------------------------------------------------------------------

I was able to perform a build which outcome of index.html looking like this:

--------------------------------------------------------------------------------------
<div id="myspapp"></div>
<script type="text/javascript" src="/_catalogs/masterpage/WebParts/myspapp/script.js"
    title="My First Script editor webpart!"
    description="Script editor webpart with React App, who would have thought!"></script>
--------------------------------------------------------------------------------------

and then after running build.ps1, I ended up with myspapp.webpart definition delivering encoded script tag providing me default properties with pre-set values.

--------------------------------------------------------------------------------------
{…}
<property name="Content" type="string">&lt;div id=&quot;myspapp&quot;&gt;&lt;/div&gt;&lt;script type=&quot;text/javascript&quot; src=&quot;/_catalogs/masterpage/WebParts/myspapp/script.js&quot; title=&quot;My First Script editor webpart!&quot; description=&quot;Script editor webpart with React App, who would have thought!&quot;&gt;&lt;/script&gt;</property>
{…}

There wasn’t much left to complete my goal. I needed only to transfer attributes from script tag to App React.Component, by updating index.tsx file with code that gets the work done.

{...}

let scriptElement = (document.currentScript as HTMLScriptElement);
if (!scriptElement) {
  const scripts = document.getElementsByTagName('script');
  scriptElement = scripts[scripts.length - 1];
}

{...}

const loadWebPartProps = () => {
  const props = new WebPartProperties();
  Object.entries(props).forEach((x) => {
    props[x[0]] = scriptElement.getAttribute(x[0]);
  });
  return props;
}

const props = loadWebPartProps() as WebPartProperties;

{...}

  ReactDOM.render(
    <App {...props} />,
    divElement
  );

{...}
--------------------------------------------------------------------------------------

Just for clearance, I really like to get my properties to be type assigned, so I’ve mapped my properties to WebPartProperties class.
Defined type unfortunately cannot be interface but class due to inability of TS to iterate over properties in interface, so I ended up with this:

--------------------------------------------------------------------------------------
export class WebPartProperties {
    constructor(public title: string = '', public description: string = '') {

    }
}
--------------------------------------------------------------------------------------

I was already happy enough to say my project template was complete, but I noticed a problem with test build. It turn out that running test failed due to undefined style variables. It took me a while to identify why it is so, and concluded it required a configuration update. I needed to install jest-css-modules-transform module 

--------------------------------------------------------------------------------------
npm I jest-css-modules-transoform
--------------------------------------------------------------------------------------

Then, I’ve took on a workbench package.json where my jest configuration is located and added jest-css-modules-transform just between typescriptTransform and cssTransform.

--------------------------------------------------------------------------------------
{...}
"^.+\\.tsx?$": "<rootDir>/config/jest/typescriptTransform.js",
".+\\.(css|styl|less|sass|scss)$": "<rootDir>/node_modules/jest-css-modules-transform",
"^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
{...}
--------------------------------------------------------------------------------------

I was able to test my project!
Now it time to verify my work. I’ve uploaded myspapp.webpart file into WebPart gallery and also script.js file under /_catalogs/masterpage/WebParts/myspapp location (MasterPage gallery). 


Thanks you for reading. That’s it! 

