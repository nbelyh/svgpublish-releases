
interface IRequestContext {
    /**
     * Current document
     */
    document: IDocument;
    /**
     * Executes a batch script
     */
    sync(): Promise<void>;
}

declare type BatchFunction = (ctx: IRequestContext) => void;

interface IVisio {
    run(fn: BatchFunction);
}

interface IApplication  {
    /**
    * Show or Hide the standard toolbars
    */
    showToolbars: boolean;

    /**
    * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
    */
    load(param?: object);
}

interface IBoundingBox {
    /**
     * The distance between the top and bottom edges of the bounding box of the shape, excluding any data graphics associated with the shape
     */
    height: number;
    /**
     * The distance between the left and right edges of the bounding box of the shape, excluding any data graphics associated with the shape
     */
    width: number;
    /**
     * An integer that specifies the x-coordinate of the bounding box
     */
    x: number;
    /**
     * An integer that specifies the y-coordinate of the bounding box
     */
    y: number;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IComment {
    /**
     * A string that specifies the name of the author of the comment
     */
    author: string;
    /**
     * A string that contains the comment text
     */
    text: string;
    /**
     * A string that specifies the date when the comment was created
     */
    date: string;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface ICommentCollection {
    /**
     * A collection of comment objects. Read-only
     */
    items: IComment[];
    /**
     * Gets the number of Comments
     */
    getCount(): number;
    /**
     * Gets the Comment using its name
     */
    getItem(key: string): IComment;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

declare type EventHandler<T> = (args:T) => void;

interface IEventHandler<T> {
    add(handler: EventHandler<T>);
    remove(handler: EventHandler<T>);
}

interface IDataRefreshCompleteEventArgs  {
    /**
     * Gets the successfailure of the DataRefreshComplete event
     */
    success: boolean;
    /**
     * Gets the document object that raised the DataRefreshComplete event
     */
    document: IDocument;
}

interface IDocument  {
    /**
     * Represents a Visio application instance that contains this document. Read-only
     */
    application: IApplication;
    /**
     * Represents a collection of pages associated with the document. Read-only
     */
    pages: IPageCollection;
    /**
     * Returns the DocumentView object. Read-only
     */
    view: IDocumentView;
    /**
     * Returns the Active Page of the document
     */
     getActivePage() : IPage;

    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
    /**
     * Set the Active Page of the document
     */
    setActivePage(pageName: string);
    /**
     * Triggers the refresh of the data in the Diagram, for all pages
     */
    startDataRefresh();
    /**
     * 
     */
    onShapeMouseLeave: IEventHandler<IShapeMouseLeaveEventArgs>;
    onShapeMouseEnter: IEventHandler<IShapeMouseEnterEventArgs>;
    onSelectionChanged: IEventHandler<ISelectionChangedEventArgs>;
    onPageLoadComplete: IEventHandler<IPageLoadCompleteEventArgs>;
    onDataRefreshComplete : IEventHandler<IDataRefreshCompleteEventArgs>;
}

interface IDocumentView {
    /**
     * Disable Hyperlinks
     */
    disableHyperlinks: boolean;
    /**
     * Disable Pan
     */
    disablePan: boolean;
    /**
     * Disable Zoom
     */
    disableZoom: boolean;
    /**
     * Hide Diagram Boundary
     */
    hideDiagramBoundry: boolean;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IHighlight {
    /**
     * A string that specifies the color of the highlight. It must have the form "#RRGGBB", 
     * where each letter represents a hexadecimal digit between 0 and F, and where RR is the red value between 0 and 0xFF (255),
     *  GG the green value between 0 and 0xFF (255), and BB is the blue value between 0 and 0xFF (255)
     */
    color: string;

    /**
     * A positive integer that specifies the width of the highlight's stroke in pixels
     */
    width: number;

    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IHyperlink {
    /**
     * Gets the address of the Hyperlink object. Read-only
     */
    address: string;
    /**
     * Gets the description of a hyperlink. Read-only
     */
    description: string;
    /**
     * Gets the sub-address of the Hyperlink object. Read-only
     */
    subAddress: string;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IHyperlinkCollection {
    /**
     * A collection of hyperlink objects. Read-only
     */
    items: IHyperlink[];
    /**
     * Gets the number of hyperlinks
     */
    getCount(): number;
    /**
     * Gets a Hyperlink using its key (name or Id).	
     */
    getItem(key: any): IHyperlink;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface ILoadOption {
    /**
     * Provide comma-delimited list or an array of parameter/relationship names to be loaded upon an executeAsync call,
     * for example, "property1, relationship1", [ "property1", "relationship1"]. Optional
     */
    select: any;
    /**
     * Provide comma-delimited list or an array of relationship names to be loaded upon an executeAsync call, 
     * for example, "relationship1, relationship2", [ "relationship1", "relationship2"]. Optional
     */
    expand: any;
    /**
     * Specify the number of items in the queried collection to be included in the result. Optional
     */
    top: number;
    /**
     * Specify the number of items in the collection that are to be skipped and not included in the result. 
     * If top is specified, the selection of result will start after skipping the specified number of items. Optional
     */
    skip: number;
}

interface IPage {
    /**
     * Returns the height of the page. Read-only
     */
    height: number;
    /**
     * Index of the Page. Read-only
     */
    index: number;
    /**
     * Whether the page is a background page or not. Read-only
     */
    isBackground: boolean;
    /**
     * Page name. Read-only
     */
    name: string;
    /**
     * Returns the width of the page. Read-only
     */
    width: number;
    /**
     * Returns the Comments Collection. Read-only
     */
    comments: ICommentCollection;
    /**
     * Shapes in the Page. Read-only.	
     */
    shapes: IShapeCollection;
    /**
     * Returns the view of the page. Read-only
     */
    view: IPageView;
    /**
     * Set the page as Active Page of the document
     */
    activate();
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IPageCollection  {
    /**
     * A collection of page objects. Read-only.	
     */
    items: IPage[];
    /**
     * Gets the number of pages in the collection.	
     */
    getCount() : number;
    /**
     * Gets a page using its key (name or Id)
     */
    getItem(key: any): IPage;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IPageLoadCompleteEventArgs  {
    /**
     * Gets the name of the page that raised the PageLoad event
     */
    pageName: string;
    /**
     * Gets the success or failure of the PageLoadComplete event
     */
    success: boolean;
}

interface IPageView {
    /**
     * GetSet Page's Zoom level.	
     */
    zoom: number;
    /**
     * Pans the Visio drawing to place the specified shape in the center of the view
     */
    centerViewportOnShape(shapeId: number);
    /**
     * Fit Page to current window
     */
    fitToWindow();
    /**
     * Returns the position object that specifies the position of the page in the view
     */
    getPosition(): IPosition;
    /**
     * Represents the Selection in the page
     */
    getSelection() : ISelection;
    /**
     * To check if the shape is in view of the page or not
     */
    isShapeInViewport(shape: IShape): boolean;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
    /**
     * Sets the position of the page in the view
     */
    setPosition(position: IPosition);
}

interface IPosition {
    /**
     * An integer that specifies the x-coordinate of the object, which is the signed 
     * value of the distance in pixels from the viewport's center to the left boundary of the page
     */
    x: number;
    /**
     * An integer that specifies the y-coordinate of the object, which is the signed
     *  value of the distance in pixels from the viewport's center to the top boundary of the page
     */
    y: number;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     */
    load(param?: object);
}

interface ISelection {
    /**
     * Gets the Shapes of the Selection Read-only
     */
    shapes: IShapeCollection;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface ISelectionChangedEventArgs  {
    /**
     * Gets the array of shape names that raised the SelectionChanged event
     */
    shapeNames: string[];
    /**
     * Gets the name of the page which has the ShapeCollection object that raised the SelectionChanged event
     */
    pageName: string;
}

interface IShape {
    /**
     * Shape's Identifier. Read-only
     */
    id: number;
    /**
     * Shape's name. Read-only
     */
    name: string;
    /**
     * Returns true, if shape is selected. User can set true to select the shape explicitly
     */
    select: boolean;
    /**
     * Shape's Text. Read-only
     */
    text: string;
    /**
     * Returns the Comments Collection. Read-only
     */
    comments: ICommentCollection;
    /**
     * Returns the Hyperlinks collection for a Shape object. Read-only
     */
    hyperlinks: IHyperlinkCollection;
    /**
     * Returns the Shape's Data Section. Read-only
     */
    shapeDataItems : IShapeDataItemCollection;
    /**
     * Gets SubShape Collection. Read-only
     */
    subShapes: IShapeCollection;
    /**
     * Returns the view of the shape. Read-only
     */
    view: IShapeView;
    /**
     * Returns the BoundingBox object that specifies bounding box of the shape
     */
    getBounds() : IBoundingBox;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IShapeCollection {
    /**
     * A collection of shape objects. Read-only
     */
    items: IShape[];
    /**
     * Gets the number of Shapes in the collection
     */
    getCount() : number;
    /**
     * Gets a Shape using its key (name or Index).	
     */
    getItem(key:any): IShape;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IShapeDataItem {
    /**
     * A string that specifies the format of the shape data item. Read-only
     */
    format: string;
    /**
     * A string that specifies the formatted value of the shape data item. Read-only
     */
    formattedValue: string;
    /**
     * A string that specifies the label of the shape data item. Read-only
     */
    label: string;
    /**
     * A string that specifies the value of the shape data item. Read-only
     */
    value: string;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IShapeDataItemCollection {
    /**
     * A collection of shapeDataItem objects. Read-only
     */
    items: IShapeDataItem[];
    /**
     * Gets the number of Shape Data Items
     */
    getCount(): number;
    /**
     * Gets the ShapeDataItem using its name
     */
    getItem(key: string): IShapeDataItem;
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

interface IShapeMouseEnterEventArgs {
    /**
     * Gets the name of the shape object that raised the MouseEnter event
     */
    shapeName: string;
    /**
     * Gets the name of the page which has the shape object that raised the MouseEnter event
     */
    pageName: string;
}

interface IShapeMouseLeaveEventArgs  {
    /**
     * Gets the name of the shape object that raised the MouseLeave  event
     */
    shapeName: string;
    /**
     * Gets the name of the page which has the shape object that raised the MouseLeave  event
     */
    pageName: string;
}

interface IShapeView{
    /**
     * Represents the highlight around the shape
     */
    highlight: IHighlight;
    /**
     * @param overlayType An Overlay Type -Text, Image
     * @param content Content of Overlay
     * @param horizontalAlignment Horizontal Alignment of Overlay - Left, Center, Right
     * @param verticalAlignment Vertical Alignment of Overlay - Top, Middle, Bottom
     * @param width Overlay Width
     * @param height Overlay Height
     * Adds an overlay on top of the shape
     */
    addOverlay(overlayType: number, content: string, horizontalAlignment: number, verticalAlignment: number, width: number, height: number): number;
    /**
     * Removes particular overlay or all overlays on the Shape
     * @param overlayId An Overlay Id. Removes the specific overlay id from the shape
     */
    removeOverlay(overlayId: number)
    /**
     * Fills the proxy object created in JavaScript layer with property and object values specified in the parameter
     * @param param Optional. Accepts parameter and relationship names as delimited string or an array. Or, provide loadOption object.	
     */
    load(param?: object);
}

declare const Visio: IVisio;
