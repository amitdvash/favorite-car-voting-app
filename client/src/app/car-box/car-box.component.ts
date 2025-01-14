import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CarService } from '../car.service';

@Component({
  standalone: true,
  selector: 'app-car-box',
  templateUrl: './car-box.component.html',
  styleUrls: ['./car-box.component.css'],
})
export class CarBoxComponent {
  @Input() carImage!: string;
  @Input() carId!: number;
  votes: number = 0; // Default number of votes
  isClicked = false;
  @Output() voted = new EventEmitter<void>(); // Emits an event when a vote is cast, for the message: "Thank you for your vote"


  constructor(private carService: CarService) {}

  // Handle votes when the user clicks on the image
  addVote(event: MouseEvent): void {
    event.preventDefault(); 
    this.isClicked = true;
    this.carService.addVote(this.carId);
    setTimeout(() => {
      this.isClicked = false;
    }, 200); // After 200ms isClicked will be false again
    this.voted.emit(); // Notify the parent component

  }

  // Get the current width of the progress bar dynamically
  getProgressBarWidth(): string {
    const maxVotes = this.carService.getMaxVotes();
    const car = this.carService.getCarById(this.carId);
    if (!car || maxVotes === 0) return '0%'; // Prevent division by zero
    const width = (car.votes / maxVotes) * 100;
    return `${width}%`;
  }

  // Get the number of votes for this car
  getVotes(): number {
    const car = this.carService.getCarById(this.carId);
    return car ? car.votes : 0;
  }
}
