import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-news',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News implements OnInit {
  posts: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.http.get('http://localhost:3000/api/post').subscribe({
      next: (res: any) => {
        this.posts = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.posts = [];
        this.isLoading = false;
      },
    });
  }
}
