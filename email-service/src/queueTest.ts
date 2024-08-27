import { EmailQueue } from "./queue";

const queue = new EmailQueue();

queue.add(async () => {
  console.log("Task 1 executed");
});

queue.add(async () => {
  console.log("Task 2 executed");
});
