import { Button } from "./ui/button";
import FormDialog from "./dialogs/FormDialog";
import { useState } from "react";
import { FeedbackForm } from "./forms/FeedbackForm";

const FeedbackTrigger = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={"outline"}
        onClick={() => setIsDialogOpen(true)}
        className="ml-auto text-xs"
      >
        Feedback
      </Button>
      <FormDialog
        title="Leave Feedback"
        description="Thanks for using the app. Share your feedback, ideas, or issues to help me improve the experience."
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        formComponent={
          <FeedbackForm onSuccess={() => setIsDialogOpen(false)} />
        }
      />
    </>
  );
};

export default FeedbackTrigger;
