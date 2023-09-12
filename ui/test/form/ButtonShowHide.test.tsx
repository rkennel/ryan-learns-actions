import {fireEvent, render, RenderResult, screen, waitFor} from "@testing-library/react";
import ButtonShowHide, {ButtonShowHideProps} from "../../src/form/ButtonShowHide";
import Box from "@mui/material/Box";

function renderComponent(props: ButtonShowHideProps): RenderResult {
    return render(
        <Box>
            <ButtonShowHide visible={props.visible} buttonText={props.buttonText} switchFn={props.switchFn}/>
            <Box className={"showHide"} sx={{display:"block"}}>Testing the ability to Show and Hide</Box>
        </Box>);
}

describe("Default Display - Visible=true", () => {

    it("Should be contained",()=>{
        renderComponent({switchFn:vi.fn(), buttonText: "Test"});
        const button = screen.getByRole('button', { name: 'Test' });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(button).toHaveClass("MuiButton-contained");
    });

    it("Should have VisibilityIcon",()=>{
        renderComponent({switchFn:vi.fn(), buttonText: "Test"});
        const icon = screen.getByTestId("VisibilityIcon");
        expect(icon).toBeDefined();
    });

    it("Switch Function was not called",()=>{
        const switchFn = vi.fn();

        renderComponent({switchFn: switchFn, buttonText: "Test"});

        expect(switchFn).not.toHaveBeenCalled();

    });
});

describe("Click to hide visibility",  () => {

    it("Should be outlined",async ()=>{
        renderComponent({switchFn:vi.fn(), buttonText: "Test"});
        const button = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(button);

        await waitFor(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(button).toHaveClass("MuiButton-outlined");
        });

    },100);

    it("Should have VisibilityOffIcon",async ()=>{
        renderComponent({switchFn:vi.fn(), buttonText: "Test"});
        const button = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(button);

        await waitFor(() => {
            const icon = screen.getByTestId("VisibilityOffIcon");
            expect(icon).toBeDefined();
        });

    },100);

    it("Should call the switch function",async ()=>{

        const switchFn = vi.fn();
        renderComponent({switchFn: switchFn, buttonText: "Test"});

        const button = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(button);

        await waitFor(() => {
            expect(switchFn).toHaveBeenCalled();
        });

    },100);
});

describe("Click to show visibility",  () => {

    it("Should be contained",async ()=>{
        renderComponent({switchFn:vi.fn(), buttonText: "Test", visible:false});
        const button = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(button);

        await waitFor(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(button).toHaveClass("MuiButton-contained");
        });

    },100);

    it("Should have VisibilityIcon",async ()=>{
        renderComponent({switchFn:vi.fn(), buttonText: "Test", visible:false});
        const button = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(button);

        await waitFor(() => {
            const icon = screen.getByTestId("VisibilityIcon");
            expect(icon).toBeDefined();
        });

    },100);

    it("Should call the switch function",async ()=>{
        const switchFn = vi.fn();
        renderComponent({switchFn: switchFn, buttonText: "Test", visible:false});

        const button = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(button);

        await waitFor(() => {
            expect(switchFn).toHaveBeenCalled();
        });

    },100);
});

