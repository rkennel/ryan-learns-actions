import {act, render, RenderResult} from "@testing-library/react";
import Box from "@mui/material/Box";
import ButtonFilter, {ButtonFilterProps, FilterOption} from "../../src/form/ButtonFilter";

function renderComponent(props: ButtonFilterProps): RenderResult {
    return render(
        <Box>
            <ButtonFilter buttonText={props.buttonText} active={props.active} filterOptions={props.filterOptions} setFilterOptions={props.setFilterOptions}/>
        </Box>);
}


function isMenuItemChecked(menuItem:HTMLElement):boolean{

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return menuItem.querySelectorAll("input")[0].checked;
}

function clickMenuItem(menuItem:HTMLElement){
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return menuItem.querySelectorAll("input")[0].click();
}

let filterOptions = [
    {optionText:"A",optionValue:"Value A",checked:true},
    {optionText:"B",optionValue:"Value B",checked:false},
    {optionText:"C",optionValue:"Value C",checked:true}
];

const props = {
    buttonText: "Test Button",
    active: true,
    filterOptions: filterOptions,
    setFilterOptions: (options:FilterOption[])=>{
        filterOptions = options;
    }
} as ButtonFilterProps;

function clickFormButton(renderResult: RenderResult) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    renderResult.getByRole("button").click();
}

describe("Displays according to the initial configuration",()=>{

    it("Should display the button text",()=>{
        const renderResult = renderComponent(props);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(renderResult.getByRole("button") as HTMLButtonElement).toHaveTextContent(props.buttonText);
    });

    it("When Button is pressed the three options are displayed",async ()=>{
        const renderResult = renderComponent(props);

        act(() => {
            clickFormButton(renderResult);
        });

        const menuitems=renderResult.getAllByRole("menuitem");

        expect(menuitems.length).toBe(3);
        expect(menuitems[0]).toHaveTextContent("A");
        expect(isMenuItemChecked(menuitems[0])).toBe(true);
        expect(menuitems[1]).toHaveTextContent("B");
        expect(isMenuItemChecked(menuitems[1])).toBe(false);
        expect(menuitems[2]).toHaveTextContent("C");
        expect(isMenuItemChecked(menuitems[2])).toBe(true);
    });

})

describe("Interacting with options",()=>{

    it("updates the options selections when clicked",()=>{

        const renderResult = renderComponent(props);

        act(() => {
            clickFormButton(renderResult);
        });

        act(() => {
            const menuitems = renderResult.getAllByRole("menuitem");
            clickMenuItem(menuitems[0]);
        });

        expect(filterOptions[0].checked).toBe(false);
    });

});

