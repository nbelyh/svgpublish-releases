
interface IContext {
    document: IDocument;
    sync();
}

declare type BatchFunction = (ctx: IContext) => void;

interface IVisio {
    run(fn: BatchFunction);
}

interface IApplication  {
    showToolbars: boolean;
    load(param?: object);
}

///////////////////

interface IComment {
    author: string;
    text: string;
    date: string;
    load(param?: object);
}

interface ICommentCollection {
    items: IComment[];
}

///////////////////

interface IPageView {
    zoom: number;
    centerViewportOnShape(shapeId: number);
}

interface IShapeCollection {
    getCount() : number;
    getItem(key:any): IShape;
    load(param?: object);
}

interface IPage {
    height: number;
    index: number;
    isBackground: boolean;
    name: string;
    width: number;

    shapes: IShapeCollection;
    comments: ICommentCollection;
    view: IPageView;

    activate();
    load(param?: object);
}

interface IPageCollection  {
    items: IPage[];
    getCount() : number;
    getItem(key: any): IPage;
}

interface IShapeView{
    highlight: boolean;
}

interface IShape {
    id: number;
    name: string;
    select: boolean;
    text: string;

    comments: ICommentCollection;
    subShapes: IShapeCollection;
    view: IShapeView;

	getBounds(): IBoundingBox;
    load(param?: object);
}

interface IDocumentView {
    disableHyperlinks: boolean;
    disablePan: boolean;
    disableZoom: boolean;
    hideDiagramBoundry: boolean;
    load(param?: object);
}

interface IDocument  {
    application: IApplication;
    pages: IPageCollection;
    view: IDocumentView;
}

interface IBoundingBox {
    height: number;
    width: number;
    x: number;
    y: number;
    load(param?: object);
}

declare const Visio: IVisio;
