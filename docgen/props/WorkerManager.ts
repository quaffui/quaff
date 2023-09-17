import { Worker } from "worker_threads";
import os from "os";
import EventEmitter from "events";

type ExtendedWorker = {
  worker: Worker;
  isFree: boolean;
};

export type WorkerTask = {
  propsFilePath: string;
  docsPropsFilePath: string;
  hashProps?: string;
};

export default class WorkerManager extends EventEmitter {
  private workerPath: string;
  private maxWorkers: number;
  private workers: ExtendedWorker[];
  private tasks: WorkerTask[];
  private types: Record<string, string>;

  constructor(workerPath: string, tasks: WorkerTask[]) {
    super();
    this.workerPath = workerPath;
    const availableWorkers = os.availableParallelism();
    this.maxWorkers = availableWorkers >= 6 ? availableWorkers - 2 : availableWorkers - 1;
    this.tasks = tasks;
    this.workers = this.initializeWorkers();
    this.types = {};
  }

  get hasActiveTasks() {
    return this.workers.some((worker) => !worker.isFree);
  }

  private initializeWorkers(): ExtendedWorker[] {
    const workers = [];
    const workerCount = Math.min(this.maxWorkers, this.tasks.length);

    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(this.workerPath);
      const extWorker: ExtendedWorker = {
        worker,
        isFree: true,
      };

      worker.on("message", (message) => {
        if (message.event === "finished") {
          this.addToTypes(message.types);
          extWorker.isFree = true;

          this.assignNextTask(extWorker);

          this.checkIfFinished();
        }
      });

      workers.push(extWorker);
      this.assignNextTask(extWorker);
    }

    return workers;
  }

  private checkIfFinished() {
    if (!this.hasActiveTasks) {
      this.emit("finished", this.types);
      this.workers.forEach((worker) => worker.worker.terminate());
    }
  }

  private addToTypes(newTypes: Record<string, string>) {
    Object.assign(this.types, newTypes);
  }

  private assignTaskToWorker(worker: ExtendedWorker, task: WorkerTask) {
    worker.isFree = false;
    worker.worker.postMessage(task);
  }

  private assignNextTask(worker: ExtendedWorker) {
    if (this.tasks.length > 0) {
      const nextTask = this.tasks.shift();
      this.assignTaskToWorker(worker, nextTask!);
    } else {
      worker.worker.terminate();
    }
  }
}
