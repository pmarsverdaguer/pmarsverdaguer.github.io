---
title: NOTES
layout: page
---

In this page you can find all the notes i take while learning such as <a href="https://academy.hackthebox.com" target="_blank">HTB Academy</a> modules, strategies, recurrent vulnerabilities and the way to compromise them, etc.

<ul class="posts">
{% for post in site.tags.notes limit: 20 %}
  <div class="post_info">
    <li>
         <a href="{{ post.url }}">{{ post.title }}</a>
         <span>({{ post.date | date:"%Y-%m-%d" }})</span>
    </li>
    </div>
  {% endfor %}
</ul>