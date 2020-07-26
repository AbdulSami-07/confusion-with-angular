import { Component, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds : string[];
  prev : string;
  next : string;

  commentForm : FormGroup;
  comment : Comment;

  formErrors = {
    'author' : '',
    'comment' : ''
  }

  validationMessages = {
    'author' : {
      'required' : 'Author name is required.',
      'minlength' : 'Atleast 2 characters,'
    },
    'comment' : {
      'required' : 'Comment is required.'
    }
  }

  @ViewChild('cform') commentFormDirective;   // this enable us to get access to template form and then completely reset it. 

  constructor(private dishService: DishService, private route:ActivatedRoute, private location: Location, private fb: FormBuilder) {
    this.createForm();
   }

  ngOnInit() {
    // since we observable params so we don't need take snapshoot of params as we can
    //  get them as params in url changes. 

    this.dishService.getDishIds().subscribe( (dishIds) => this.dishIds = dishIds);
    this.route.params.pipe(switchMap( (params : Params) => this.dishService.getDish(params['id'])))   /* e.g of route /dishdetail/1 */
    .subscribe( dish => { 
      this.dish = dish;
      this.setPrevNext(dish.id);
    });

  }
  
  setPrevNext(dishId : string){
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1 ) % this.dishIds.length];
    this.next  = this.dishIds[(this.dishIds.length + index + 1 ) % this.dishIds.length];
  }

  goBack() : void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      rating : 5,
      comment : ["", [Validators.required]],
      author : ["",[Validators.required,Validators.minLength(2)]]
    });

    this.commentForm.valueChanges
    .subscribe( data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && (control.dirty || control.touched) && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    this.dish.comments.push(this.comment);
    console.log(this.comment);
    this.comment = null;
    // this.dishService.postDishComment(this.comment,this.dish.id); // pushing using service
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      rating : 5,
      comment: "",
      author: ""
    });
  }

}
