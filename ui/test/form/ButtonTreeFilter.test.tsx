import {act, render, RenderResult} from "@testing-library/react";
import Box from "@mui/material/Box";
import ButtonTreeFilter, {ButtonTreeFilterProps, TreeFilterOption} from "../../src/form/ButtonTreeFilter";
import {isEmpty} from "../../src/util/ObjectUtils";

function renderComponent(props: ButtonTreeFilterProps): RenderResult {
    return render(
        <Box>
            <ButtonTreeFilter buttonText={props.buttonText} active={props.active}
                              treeFilterOptions={props.treeFilterOptions}
                              setTreeFilterOptions={props.setTreeFilterOptions}/>
        </Box>);
}

function initializeProps(): ButtonTreeFilterProps {
    let treeFilterOptions: TreeFilterOption[] = [
        {
            id: "1",
            text: "First Level 1",
            checked: true,
            children: [
                {
                    id: "11",
                    text: "First Level 1, Second Level 1",
                    checked: true,
                    children: []
                },
                {
                    id: "12",
                    text: "First Level 1, Second Level 2",
                    checked: true,
                    children: []
                },
            ]
        },
        {
            id: "2",
            text: "First Level 2",
            checked: true,
            children: [
                {
                    id: "21",
                    text: "First Level 2, Second Level 1",
                    checked: true,
                    children: []
                },
                {
                    id: "22",
                    text: "First Level 2, Second Level 2",
                    checked: true,
                    children: [
                        {
                            id: "221",
                            text: "First Level 2, Second Level 2, Third Level 1",
                            checked: true,
                            children: []
                        },
                        {
                            id: "222",
                            text: "First Level 2, Second Level 2, Third Level 2",
                            checked: true,
                            children: []
                        },
                    ]
                },
            ]
        }
    ];

    const props = {
        buttonText: "Test Button",
        active: true,
        treeFilterOptions: treeFilterOptions,
    } as ButtonTreeFilterProps;

    props.setTreeFilterOptions = (treeFilterOptions: TreeFilterOption[]) => {
        props.treeFilterOptions = treeFilterOptions;
    }

    return props;
}

function clickFormButton(renderResult: RenderResult) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    renderResult.getByRole("button").click();
}

function treeItemVisible(labelText: string, renderResult: RenderResult):boolean {
    return !isEmpty(getTreeItem(labelText, renderResult));
}

export function getTreeItem(labelText: string, renderResult: RenderResult):HTMLElement {
    const elements = renderResult.getAllByRole('treeitem');

    for (let i = 0; i < elements.length; i++) {
        if(elements[i].querySelector("div.MuiTreeItem-label").textContent==labelText){
            return elements[i];
        }
    }

    return {} as HTMLElement;
}

function expandAllItemsInTreeView(renderResult: RenderResult, props: ButtonTreeFilterProps) {
    const treeFilterOptions = props.treeFilterOptions;

    act(() => {
        clickFormButton(renderResult);
    });

    act(() => {
        renderResult.getByRole('treeitem', {name: treeFilterOptions[0].text}).querySelector("div.MuiTreeItem-label").click();
    });

    act(() => {
        renderResult.getByRole('treeitem', {name: treeFilterOptions[1].text}).querySelector("div.MuiTreeItem-label").click();
    });

    act(() => {
        renderResult.getByRole('treeitem', {name: treeFilterOptions[1].children[1].text}).querySelector("div.MuiTreeItem-label").click();
    });
}

describe("Displays according to the initial configuration", () => {

    it("Should display the button text", () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(renderResult.getByRole("button") as HTMLButtonElement).toHaveTextContent(props.buttonText);
    });

    it("When Button is pressed there are initially two options displayed", async () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);

        act(() => {
            clickFormButton(renderResult);
        });

        const tree = renderResult.getByRole('tree');
        expect(tree).toBeDefined();

        const treeFilterOptions = props.treeFilterOptions;
        expect(treeItemVisible(treeFilterOptions[0].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[0].children[0].text, renderResult)).toBe(false);
        expect(treeItemVisible(treeFilterOptions[0].children[1].text, renderResult)).toBe(false);
        expect(treeItemVisible(treeFilterOptions[1].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[1].children[0].text, renderResult)).toBe(false);
        expect(treeItemVisible(treeFilterOptions[1].children[1].text, renderResult)).toBe(false);
        expect(treeItemVisible(treeFilterOptions[1].children[1].children[0].text, renderResult)).toBe(false);
        expect(treeItemVisible(treeFilterOptions[1].children[1].children[1].text, renderResult)).toBe(false);
    });

    it("When All options are expanded, it aligns with the initial configuration", async () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);
        expandAllItemsInTreeView(renderResult,props);

        const treeFilterOptions = props.treeFilterOptions;
        expect(treeItemVisible(treeFilterOptions[0].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[0].children[0].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[0].children[1].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[1].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[1].children[0].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[1].children[1].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[1].children[1].children[0].text, renderResult)).toBe(true);
        expect(treeItemVisible(treeFilterOptions[1].children[1].children[1].text, renderResult)).toBe(true);
    });

})

describe("Interacting with options", () => {

    it("updates the options selections when clicked", () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);
        expandAllItemsInTreeView(renderResult,props);

        const treeFilterOptions = props.treeFilterOptions;

        act(() => {
            const firstTreeItem = getTreeItem(treeFilterOptions[0].text, renderResult);
            firstTreeItem.querySelector("input").click();
        });

        expect(treeFilterOptions[0].checked).toBe(false);
    });

    it("updates are cascaded to children", () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);
        expandAllItemsInTreeView(renderResult,props);

        const treeFilterOptions = props.treeFilterOptions;

        act(() => {
            const firstTreeItem = getTreeItem(treeFilterOptions[0].text, renderResult);
            firstTreeItem.querySelector("input").click();
        });

        expect(treeFilterOptions[0].checked).toBe(false);
        expect(treeFilterOptions[0].children[0].checked).toBe(false);
        expect(treeFilterOptions[0].children[1].checked).toBe(false);
    });

    it("updates are cascaded to all ancestors", () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);
        expandAllItemsInTreeView(renderResult,props);

        const treeFilterOptions = props.treeFilterOptions;

        act(() => {
            const secondTreeItem = getTreeItem(treeFilterOptions[1].text, renderResult);
            secondTreeItem.querySelector("input").click();
        });

        expect(treeFilterOptions[1].checked).toBe(false);
        expect(treeFilterOptions[1].children[0].checked).toBe(false);
        expect(treeFilterOptions[1].children[1].checked).toBe(false);
        expect(treeFilterOptions[1].children[1].children[0].checked).toBe(false);
        expect(treeFilterOptions[1].children[1].children[1].checked).toBe(false);
    });

    it("Updates the options selections when clicked for lower levels in the tree view - (recursion checks)", () => {
        const props = initializeProps();
        const renderResult = renderComponent(props);
        expandAllItemsInTreeView(renderResult,props);

        const treeFilterOptions = props.treeFilterOptions;

        act(() => {
            const childTreeItem = getTreeItem(treeFilterOptions[1].children[1].text, renderResult);
            childTreeItem.querySelector("input").click();
        });

        expect(treeFilterOptions[0].checked).toBe(true);
        expect(treeFilterOptions[0].children[0].checked).toBe(true);
        expect(treeFilterOptions[0].children[1].checked).toBe(true);
        expect(treeFilterOptions[1].checked).toBe(true);
        expect(treeFilterOptions[1].children[0].checked).toBe(true);
        expect(treeFilterOptions[1].children[1].checked).toBe(false);
        expect(treeFilterOptions[1].children[1].children[0].checked).toBe(false);
        expect(treeFilterOptions[1].children[1].children[1].checked).toBe(false);
    });

});

