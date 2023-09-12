import {screen, waitFor} from "@testing-library/react";

export async function getByTitleToBeIntheDocument(title:string) {
    await waitFor(() => {
        expect(screen.getByTitle(title)).toBeInTheDocument();
    });
}